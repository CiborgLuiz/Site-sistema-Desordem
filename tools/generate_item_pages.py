#!/usr/bin/env python3
"""Gera páginas HTML para itens listados no CSV de Equipamentos.

Funcionamento:
- Lê o CSV `Sistema/DESORDEM/Itens/Equipamentos d7ca8178912546b9a539ec5e7682bae5.csv`.
- Localiza o marcador `Kit Ósseo de Campo` e gera páginas para todas as entradas abaixo dele (bloco dos 117 itens adicionados).
- Usa o arquivo de exemplo existente em `Sistema/DESORDEM/Itens/Equipamentos/Armadura de Ferro Pesado b3c40e86b71e492883bc98e6538cfc44.html`
  como template: substitui título, id do artigo e a tabela de propriedades.
- Salva os arquivos em `Sistema/DESORDEM/Itens/Equipamentos/` com o nome "{Nome} {uuid}.html".

O script pula itens que já possuam uma página cujo nome comece pelo nome do item.
"""

import csv
import os
import re
import sys
import uuid


def safe_name_for_file(name: str) -> str:
    name = name.strip()
    name = name.replace('/', '-')
    name = name.replace('\\', '-')
    # remove characters commonly unsafe in filenames
    name = re.sub(r'[<>:\"|?*]', '', name)
    name = name.replace('\n', ' ').replace('\r', '')
    return name


def build_properties_html(fields: dict) -> str:
    def row_text(label, value):
        v = value if value else '—'
        return (f'<tr class="property-row property-row-text"><th><span class="icon property-icon">'
                f'<img src="https://www.notion.so/icons/description_gray.svg" style="width:14px;height:14px;display:block"/>'
                f'</span>{label}</th><td>{v}</td></tr>')

    def row_select(label, value, color='select-value-color-default'):
        v = value if value else '—'
        return (f'<tr class="property-row property-row-select"><th><span class="icon property-icon">'
                f'<img src="https://www.notion.so/icons/arrow-circle-down_gray.svg" style="width:14px;height:14px;display:block"/>'
                f'</span>{label}</th><td><span class="selected-value {color}">{v}</span></td></tr>')

    parts = []
    parts.append(row_text('Alcance', fields.get('Alcance')))
    parts.append(row_text('Bônus', fields.get('Bônus')))
    parts.append(row_select('Categoria', fields.get('Categoria'), 'select-value-color-blue'))
    parts.append(row_text('Custo', fields.get('Custo')))
    parts.append(row_text('Dano', fields.get('Dano')))
    parts.append(row_text('Defesa', fields.get('Defesa')))
    parts.append(row_select('Durabilidade', fields.get('Durabilidade'), 'select-value-color-green'))
    parts.append(row_text('Efeito', fields.get('Efeito')))
    parts.append(row_text('Observações', fields.get('Observações')))
    parts.append(row_text('Penalidade', fields.get('Penalidade')))
    parts.append(row_text('Peso', fields.get('Peso')))
    parts.append(row_select('Raridade', fields.get('Raridade'), 'select-value-color-default'))
    parts.append(row_text('Requisitos', fields.get('Requisitos')))
    parts.append(row_text('Subtipo', fields.get('Subtipo')))

    return '<table class="properties"><tbody>\n' + '\n'.join(parts) + '\n</tbody></table>'


def main():
    cwd = os.getcwd()
    csv_name = 'Sistema/DESORDEM/Itens/Equipamentos d7ca8178912546b9a539ec5e7682bae5.csv'
    csv_path = os.path.join(cwd, csv_name)
    equip_dir = os.path.join(cwd, 'Sistema', 'DESORDEM', 'Itens', 'Equipamentos')
    template_candidate = None

    # locate a template HTML in the equipment folder
    if os.path.isdir(equip_dir):
        for fn in os.listdir(equip_dir):
            if fn.lower().startswith('armadura de ferro pesado') and fn.lower().endswith('.html'):
                template_candidate = os.path.join(equip_dir, fn)
                break

    if not os.path.exists(csv_path):
        print('CSV not found:', csv_path, file=sys.stderr)
        sys.exit(2)

    if template_candidate is None or not os.path.exists(template_candidate):
        print('Template HTML not found in', equip_dir, file=sys.stderr)
        sys.exit(3)

    with open(template_candidate, 'r', encoding='utf-8') as f:
        tmpl = f.read()

    # Read CSV
    with open(csv_path, 'r', encoding='utf-8', newline='') as f:
        reader = csv.reader(f)
        rows = list(reader)

    # find the insertion anchor 'Kit Ósseo de Campo'
    start_idx = None
    for i, row in enumerate(rows):
        if row and row[0].strip() == 'Kit Ósseo de Campo':
            start_idx = i + 1
            break

    if start_idx is None:
        print('Boundary "Kit Ósseo de Campo" not found — abortando.', file=sys.stderr)
        sys.exit(4)

    # prepare template split points
    start_marker = '<table class="properties">'
    end_marker = '</tbody></table></header>'
    if start_marker in tmpl and end_marker in tmpl:
        prefix, rest = tmpl.split(start_marker, 1)
        _, suffix_after_table = rest.split(end_marker, 1)
    else:
        print('Template markers not found — usando conteúdo inteiro como base.', file=sys.stderr)
        prefix = tmpl
        suffix_after_table = ''

    os.makedirs(equip_dir, exist_ok=True)
    existing = os.listdir(equip_dir)

    created = 0
    skipped = 0
    failed = []

    for row in rows[start_idx:]:
        if not row or not row[0].strip():
            continue
        nome = row[0].strip()
        # skip if already exists
        if any(fn.lower().startswith(nome.lower()) for fn in existing):
            skipped += 1
            continue

        # map fields based on known CSV schema
        def g(i):
            return row[i].strip() if len(row) > i and row[i].strip() else ''

        fields = {
            'Alcance': g(1),
            'Bônus': g(5),
            'Categoria': g(6),
            'Custo': g(9),
            'Dano': g(10),
            'Defesa': g(11),
            'Durabilidade': g(13),
            'Efeito': g(14),
            'Observações': g(18),
            'Penalidade': g(19),
            'Peso': g(20),
            'Raridade': g(21),
            'Requisitos': g(23),
            'Subtipo': g(24),
        }

        props_html = build_properties_html(fields)
        article_id = str(uuid.uuid4())

        if start_marker in tmpl and end_marker in tmpl:
            new_html = prefix + start_marker + props_html + end_marker + suffix_after_table
        else:
            # fallback minimal page
            new_html = f'<html><head><meta charset="utf-8"><title>{nome}</title></head><body>'
            new_html += f'<h1>{nome}</h1>' + props_html + f'<p>{fields.get("Efeito") or fields.get("Observações") or ""}</p></body></html>'

        # small substitutions
        new_html = new_html.replace('<title>Armadura de Ferro Pesado</title>', f'<title>{nome}</title>')
        new_html = new_html.replace('<h1 class="page-title" dir="auto">Armadura de Ferro Pesado</h1>',
                                    f'<h1 class="page-title" dir="auto">{nome}</h1>')
        # replace article id attribute if present
        new_html = re.sub(r'<article id="[^"]+"', f'<article id="{article_id}"', new_html, count=1)

        fname = f"{safe_name_for_file(nome)} {uuid.uuid4().hex}.html"
        out_path = os.path.join(equip_dir, fname)
        try:
            with open(out_path, 'w', encoding='utf-8') as out:
                out.write(new_html)
            created += 1
            existing.append(fname)
        except Exception as e:
            failed.append((nome, str(e)))

    print(f'Created {created} pages, skipped {skipped}, failed {len(failed)}')
    if failed:
        for n, err in failed:
            print('FAILED:', n, err, file=sys.stderr)


if __name__ == '__main__':
    main()
