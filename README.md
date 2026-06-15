# Cyanobacteria Phylo Pipeline

A single-file, zero-dependency web app that automates the workflow for comparing **protein-domain-based phylogenetic trees** against **NCBI taxonomy trees** for cyanobacteria.

**Hosted version:** https://chosenan.github.io/phylo-pipeline/ *(enable GitHub Pages — see below)*

---

## What it does

You select a cluster of organisms on [UMAP of Life](https://umap.mcdb.ucla.edu/v2/), and this tool helps you turn that selection into a side-by-side comparison of two trees:

- the **domain tree** — clustering based on Pfam domain co-occurrence (from UMAP of Life)
- the **taxonomy tree** — the formal NCBI taxonomy (from [NCBI CommonTree](https://www.ncbi.nlm.nih.gov/Taxonomy/CommonTree/wwwcmt.cgi))

It then computes how much the two disagree, which tells you where domain content mirrors evolutionary history and where it doesn't (HGT, convergence, taxonomic revision).

The app automates the parsing/formatting/comparison steps; the steps that require external sites stay manual.

## How to use

| Step | What you do |
|------|-------------|
| **1. Parse species list** | Paste the UMAP CSV/bullet export (or drop a `.csv`/`.txt` file). Extracts species, taxIDs, taxonomy path, and UMAP coordinates into a sortable table. |
| **2. Build the taxonomy tree** | TaxIDs are auto-extracted, one per line — download the `.txt` and submit it to NCBI CommonTree (choose **Phylip tree** format, save the `.phy`). Drop the `.phy` back in: it's stripped of Phylip headers, validated, converted to clean Newick, and loaded straight into the Step 3 taxonomy slot. |
| **3. Compare trees** | Confirm/paste both Newick trees. Computes **Robinson-Foulds distance** (raw + normalized), leaf overlap, and fuzzy name matching; renders interactive side-by-side cladograms; and exports a report or a `.zip` of all outputs. |
| **4. Workflow guide** | The full manual, with automated steps badged. |

### Highlights

- **True Robinson-Foulds distance** — a real Newick parser builds tree structures, enumerates bipartitions on the shared leaf set, and reports raw + normalized RF (0 = identical topology, 1 = maximally different).
- **Interactive side-by-side cladograms** — pan/zoom SVG viewers for the domain and taxonomy trees, with cross-tree hover (highlight the same taxon in both) and **right-click-drag box-select** to spotlight a set of leaves across both trees at once.
- **Taxonomy coloring** — color leaf labels by a chosen rank (Phylum / Class / Order / Family / Genus) with a per-group checkbox legend to toggle groups on and off. Colors use golden-ratio hue spacing so adjacent groups stay visually distinct.
- **Fuzzy name matching** — aligns taxa whose names differ by strain suffixes / bracket formatting / `= synonym` notation before comparing, with a similarity-scored mapping table.
- **Drag-and-drop** file input on Steps 1 and 2.
- **Download all** — bundles `taxids.txt`, `domain_tree.nwk`, `taxonomy_tree.nwk`, and `comparison_report.txt` into one `.zip` (via JSZip; falls back to individual downloads if offline).
- **Dark mode** toggle (persisted) and **progress checkmarks** in the sidebar.

## Workflow overview

```
  UMAP of Life --select region--> CSV export
        |                            |
        |                    [1] parse species --> taxIDs.txt
        |                                              |
        |                                   NCBI CommonTree (Phylip)
        |                                              |
        |                                          .phy file
        |                                              |
        |                          [2] .phy --> clean Newick -- taxonomy tree
        |                                                              |
  "Make Phylogenetic Tree (domain count)" --> domain Newick           |
        |                                                              |
        '--------------> [3] Compare <---------------------------------'
                              |
              RF distance, leaf overlap, name mapping, interactive cladograms
                              |
                       Phylo.io (visual check)
```

Automated by this app: species parsing, taxID extraction, `.phy` → Newick conversion, and the comparison. Manual (external sites): UMAP selection/export, NCBI submission, domain-tree download, and optional Phylo.io visualization.

## External tools

- [UMAP of Life v2](https://umap.mcdb.ucla.edu/v2/) — select organisms, export CSV, build the domain tree
- [NCBI CommonTree](https://www.ncbi.nlm.nih.gov/Taxonomy/CommonTree/wwwcmt.cgi) — taxonomy tree (Phylip)
- [Phylo.io](https://phylo.io) — visual side-by-side tree comparison

## Run locally

No build step, no server. Just open the file:

```
git clone https://github.com/ChosenAN/phylo-pipeline.git
cd phylo-pipeline
# open index.html in any modern browser
```

Everything runs client-side. The only external resource is the JSZip CDN (used for "Download all"); every other feature works fully offline, and zip export degrades gracefully to individual downloads.

## Hosting on GitHub Pages

Settings → Pages → Source: **Deploy from a branch** → Branch: `main` / `/ (root)` → Save. The `.nojekyll` file ensures files are served as-is. The site then lives at `https://chosenan.github.io/phylo-pipeline/`.
