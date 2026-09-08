'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { importProductsMassAction, MassImportRow } from './actions'
import {
  UploadCloudIcon,
  FileSpreadsheetIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  PackageIcon,
  PlusIcon,
  TrashIcon
} from '@/components/Icons'
import { useToast } from '@/components/Toast'

interface CategoryItem {
  id: string
  name: string
  slug: string
  parentId: string | null
}

export interface MassImportRowUI extends MassImportRow {
  files?: File[]
}

function emptyRow(): MassImportRowUI {
  return {
    name: '',
    reference: '',
    color: '',
    categoryName: '',
    subCategoryName: '',
    brand: '',
    price: 0,
    oldPrice: null,
    purchasePrice: null,
    stock: 0,
    stockThreshold: null,
    barcode: '',
    supplierReference: '',
    weight: null,
    description: '',
    shortDescription: '',
    active: true,
    ageMin: null,
    ageMax: null
  }
}

export default function CsvImportClient({
  categories,
}: {
  categories: CategoryItem[]
}) {
  const [rows, setRows] = useState<MassImportRowUI[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const topScrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragScrollLeft = useRef(0)

  const { showToast } = useToast()

  const mainCategories = categories.filter(c => !c.parentId)

  // Initialize with 1 empty row
  useEffect(() => {
    setRows([emptyRow()])
  }, [])

  // Sync top scrollbar with table scroll
  useEffect(() => {
    const table = scrollRef.current
    const top = topScrollRef.current
    if (!table || !top) return

    const syncTop = () => { top.scrollLeft = table.scrollLeft }
    const syncTable = () => { table.scrollLeft = top.scrollLeft }

    table.addEventListener('scroll', syncTop)
    top.addEventListener('scroll', syncTable)
    return () => {
      table.removeEventListener('scroll', syncTop)
      top.removeEventListener('scroll', syncTable)
    }
  }, [])

  // Document-level drag-to-scroll (fixes losing drag when mouse leaves div)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current || !scrollRef.current) return
      e.preventDefault()
      const x = e.pageX
      const walk = x - dragStartX.current
      scrollRef.current.scrollLeft = dragScrollLeft.current - walk
    }
    const onUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        if (scrollRef.current) scrollRef.current.style.cursor = 'grab'
      }
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [])

  const scrollBy = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  const addEmptyRows = (count: number) => {
    setRows(prev => [...prev, ...Array.from({ length: count }, emptyRow)])
  }

  const insertRowAfter = (idx: number) => {
    setRows(prev => {
      const next = [...prev]
      next.splice(idx + 1, 0, emptyRow())
      return next
    })
  }

  const handleCellChange = (idx: number, field: keyof MassImportRowUI, value: any) => {
    setRows(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const removeRow = (idx: number) => {
    setRows(prev => prev.filter((_, i) => i !== idx))
  }

  // Start drag: record position, ignore clicks on form elements
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    const tag = target.tagName
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'LABEL') return
    isDragging.current = true
    dragStartX.current = e.pageX
    dragScrollLeft.current = scrollRef.current?.scrollLeft ?? 0
    if (scrollRef.current) scrollRef.current.style.cursor = 'grabbing'
  }

  const handleImport = async () => {
    const validRows = rows.filter(r => r.name && r.name.trim() !== '')
    if (validRows.length === 0) {
      setErrorMsg('Aucune donnée valide à importer. Remplissez au moins le nom.')
      return
    }

    setImporting(true)
    setErrorMsg(null)

    const formData = new FormData()
    const jsonData = validRows.map(({ files, ...rest }) => rest)
    formData.append('data', JSON.stringify(jsonData))

    validRows.forEach((row, i) => {
      if (row.files) {
        row.files.forEach(f => {
          formData.append(`file_${i}`, f)
        })
      }
    })

    const res = await importProductsMassAction(formData)
    setImporting(false)

    if (res?.error) {
      setErrorMsg(res.error)
    } else {
      setResult(res)
    }
  }

  const downloadTemplate = () => {
    const headers = [
      'nom', 'couleur', 'sku', 'categorie', 'sous_categorie',
      'marque', 'prix_achat', 'prix_vente', 'prix_promo',
      'stock', 'seuil_stock', 'ean', 'ref_fournisseur',
      'poids', 'age_min', 'age_max', 'description_courte', 'description', 'statut'
    ]
    const exampleRow = [
      'Trottinette enfant', 'Rose', 'TROT-001', 'Fille', 'Poupées',
      'Globber', '2500', '3500', '',
      '10', '2', '1234567890123', 'FOURN-TROT',
      '2.5', '3', '8', 'Super trottinette', 'Description longue ici...', 'actif'
    ]

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + headers.join(";") + "\n"
      + exampleRow.join(";") + "\n"

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "modele_import_produits.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const parseCSV = (text: string) => {
    const lines = text.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0)
    if (lines.length < 2) return

    const delimiter = (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length ? ';' : ','

    const splitLine = (line: string) => {
      const result: string[] = []
      let current = ''
      let inQuotes = false
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') inQuotes = !inQuotes
        else if (char === delimiter && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, ''))
          current = ''
        } else current += char
      }
      result.push(current.trim().replace(/^"|"$/g, ''))
      return result
    }

    const headers = splitLine(lines[0]).map(h => h.toLowerCase().trim())
    const getIdx = (keys: string[]) => headers.findIndex(h => keys.some(k => h.includes(k)))

    const idxName = getIdx(['nom', 'produit', 'name'])
    const idxColor = getIdx(['couleur', 'variante', 'color'])
    const idxSku = getIdx(['sku', 'ref', 'référence'])
    const idxCat = getIdx(['categorie', 'catégorie'])
    const idxSub = getIdx(['sous'])
    const idxBrand = getIdx(['marque', 'brand'])
    const idxPurchase = getIdx(['achat', 'purchase'])
    const idxPrice = getIdx(['vente', 'prix', 'price'])
    const idxPromo = getIdx(['promo', 'ancien'])
    const idxStock = getIdx(['stock', 'quant'])
    const idxThresh = getIdx(['seuil'])
    const idxEan = getIdx(['ean', 'code', 'bar'])
    const idxSupp = getIdx(['fournisseur'])
    const idxWeight = getIdx(['poids', 'weight'])
    const idxDescS = getIdx(['courte'])
    const idxDesc = getIdx(['desc'])
    const idxStat = getIdx(['statut', 'actif'])

    const newRows: MassImportRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const cols = splitLine(lines[i])
      if (cols.length <= 1) continue

      newRows.push({
        name: idxName >= 0 ? cols[idxName] : '',
        color: idxColor >= 0 ? cols[idxColor] : '',
        reference: idxSku >= 0 ? cols[idxSku] : '',
        categoryName: idxCat >= 0 ? cols[idxCat] : '',
        subCategoryName: idxSub >= 0 ? cols[idxSub] : '',
        brand: idxBrand >= 0 ? cols[idxBrand] : '',
        price: idxPrice >= 0 ? parseFloat(cols[idxPrice]) || 0 : 0,
        oldPrice: idxPromo >= 0 && cols[idxPromo] ? parseFloat(cols[idxPromo]) : null,
        purchasePrice: idxPurchase >= 0 && cols[idxPurchase] ? parseFloat(cols[idxPurchase]) : null,
        stock: idxStock >= 0 ? parseInt(cols[idxStock]) || 0 : 0,
        stockThreshold: idxThresh >= 0 && cols[idxThresh] ? parseInt(cols[idxThresh]) : null,
        barcode: idxEan >= 0 ? cols[idxEan] : '',
        supplierReference: idxSupp >= 0 ? cols[idxSupp] : '',
        weight: idxWeight >= 0 && cols[idxWeight] ? parseFloat(cols[idxWeight]) : null,
        shortDescription: idxDescS >= 0 ? cols[idxDescS] : '',
        description: idxDesc >= 0 ? cols[idxDesc] : '',
        active: idxStat >= 0 ? !cols[idxStat].toLowerCase().includes('inactif') : true,
      })
    }

    setRows(newRows)
    showToast('Fichier importé. Veuillez vérifier les données ci-dessous.')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      parseCSV(text)
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  if (result) {
    return (
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--mint-light)', color: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <CheckCircleIcon size={36} />
        </div>
        <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--gray-900)' }}>
          {result.errorCount > 0 ? 'Importation partielle' : 'Importation réussie'}
        </h2>
        <p style={{ margin: '1rem 0', color: 'var(--gray-600)' }}>
          <strong style={{ color: '#16a34a' }}>{result.createdCount} créés</strong>,{' '}
          <strong>{result.updatedCount} mis à jour</strong>
          {result.errorCount > 0 && (
            <>, <strong style={{ color: '#dc2626' }}>{result.errorCount} échoué(s)</strong></>
          )}
        </p>
        {result.errors && result.errors.length > 0 && (
          <div style={{ textAlign: 'left', marginBottom: '1.25rem', padding: '0.875rem', backgroundColor: '#fef2f2', borderRadius: '8px', fontSize: '0.8rem' }}>
            <p style={{ fontWeight: 700, color: '#dc2626', marginBottom: '0.4rem' }}>Produits en erreur :</p>
            {result.errors.map((e: string, i: number) => (
              <p key={i} style={{ color: '#7f1d1d', marginBottom: '0.2rem' }}>• {e}</p>
            ))}
          </div>
        )}
        <button onClick={() => { setResult(null); setRows([emptyRow()]) }} className="btn btn-primary">
          Nouvel Import
        </button>
      </div>
    )
  }

  const tableMINW = '1800px'

  return (
    <div>
      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Tableau d'Importation Rapide</h2>
          {/* Prominent add button always visible */}
          <button
            onClick={() => addEmptyRows(1)}
            className="btn btn-primary btn-sm"
            title="Ajouter une ligne de produit"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusIcon size={15} /> Ajouter un produit
          </button>
          <button
            onClick={() => addEmptyRows(10)}
            className="btn btn-outline btn-sm"
            title="Ajouter 10 lignes"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusIcon size={15} /> +10 lignes
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={downloadTemplate} className="btn btn-outline btn-sm">
            Modèle CSV
          </button>
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
            <UploadCloudIcon size={16} /> Importer CSV
            <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
          <button onClick={handleImport} disabled={importing} className="btn btn-primary btn-sm">
            {importing ? 'Enregistrement...' : <>Enregistrer en base</>}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#dc2626', marginBottom: '1rem', borderRadius: '8px' }}>
          {errorMsg}
        </div>
      )}

      {/* Hint */}
      <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '0.5rem' }}>
        Faites glisser le tableau horizontalement, ou utilisez la barre de défilement ci-dessous.
        Le bouton <strong>+</strong> sur chaque ligne insère une nouvelle ligne juste en dessous.
      </p>

      {/* Scroll navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
        <button
          onClick={() => scrollBy(-400)}
          title="Défiler à gauche"
          style={{ border: '1px solid var(--gray-200)', background: '#fff', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}
        >
          &#8592;
        </button>
        {/* Top mirror scrollbar */}
        <div
          ref={topScrollRef}
          style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', height: '14px' }}
        >
          <div style={{ width: tableMINW, height: '1px' }} />
        </div>
        <button
          onClick={() => scrollBy(400)}
          title="Défiler à droite"
          style={{ border: '1px solid var(--gray-200)', background: '#fff', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}
        >
          &#8594;
        </button>
      </div>

      {/* Main scrollable table — drag horizontally on empty row space */}
      <div
        ref={scrollRef}
        style={{
          overflowX: 'auto',
          overflowY: 'visible',
          border: '1px solid var(--gray-200)',
          borderRadius: '8px',
          backgroundColor: '#fff',
          cursor: 'grab',
        }}
        onMouseDown={onMouseDown}
      >
        <table style={{ width: '100%', minWidth: tableMINW, borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--gray-200)' }}>
            <tr>
              <th style={{ padding: '0.75rem', textAlign: 'left', width: '30px' }}>#</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', width: '250px' }}>Nom du produit*</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', width: '120px' }}>Couleur / Var</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', width: '120px' }}>SKU</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', width: '150px' }}>Catégorie*</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', width: '150px' }}>Sous-catégorie</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', width: '120px' }}>Marque</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', width: '100px' }}>Prix Achat</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', width: '100px' }}>Prix Vente*</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', width: '100px' }}>Stock*</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', width: '150px' }}>EAN / Barre</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', width: '120px' }}>Images</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', width: '70px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const selectedCat = categories.find(c => c.name === row.categoryName)
              const subCategories = selectedCat ? categories.filter(c => c.parentId === selectedCat.id) : []

              return (
                <tr key={idx} style={{ borderBottom: '1px solid var(--gray-100)', backgroundColor: row.color ? '#f0fdfa' : 'transparent' }}>
                  {/* Row number */}
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.75rem', fontWeight: 600 }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => handleCellChange(idx, 'name', e.target.value)}
                      placeholder="Ex: Trottinette"
                      style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input
                      type="text"
                      value={row.color || ''}
                      onChange={(e) => handleCellChange(idx, 'color', e.target.value)}
                      placeholder="Rose, Bleu..."
                      style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input
                      type="text"
                      value={row.reference || ''}
                      onChange={(e) => handleCellChange(idx, 'reference', e.target.value)}
                      style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <select
                      value={row.categoryName}
                      onChange={(e) => handleCellChange(idx, 'categoryName', e.target.value)}
                      style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                    >
                      <option value="">Sélectionner</option>
                      {mainCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <select
                      value={row.subCategoryName || ''}
                      onChange={(e) => handleCellChange(idx, 'subCategoryName', e.target.value)}
                      style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                      disabled={!selectedCat || subCategories.length === 0}
                    >
                      <option value="">Sélectionner</option>
                      {subCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input
                      type="text"
                      value={row.brand || ''}
                      onChange={(e) => handleCellChange(idx, 'brand', e.target.value)}
                      style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input
                      type="number"
                      value={row.purchasePrice || ''}
                      onChange={(e) => handleCellChange(idx, 'purchasePrice', parseFloat(e.target.value))}
                      style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input
                      type="number"
                      value={row.price}
                      onChange={(e) => handleCellChange(idx, 'price', parseFloat(e.target.value))}
                      style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--gray-300)', borderRadius: '4px', borderColor: row.price <= 0 ? 'red' : 'var(--gray-300)' }}
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input
                      type="number"
                      value={row.stock}
                      onChange={(e) => handleCellChange(idx, 'stock', parseInt(e.target.value))}
                      style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input
                      type="text"
                      value={row.barcode || ''}
                      onChange={(e) => handleCellChange(idx, 'barcode', e.target.value)}
                      style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '4px 8px', borderRadius: '4px', background: 'var(--primary-light)' }}>
                      <UploadCloudIcon size={14} />
                      {row.files && row.files.length > 0 ? `${row.files.length} img(s)` : 'Ajouter'}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files) {
                            const newFiles = Array.from(e.target.files)
                            handleCellChange(idx, 'files', newFiles)
                          }
                        }}
                      />
                    </label>
                  </td>
                  {/* Actions: insert below + delete */}
                  <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <button
                        onClick={() => insertRowAfter(idx)}
                        title="Insérer une ligne après"
                        style={{
                          color: 'var(--primary)',
                          background: 'var(--primary-light)',
                          border: '1px solid var(--primary)',
                          borderRadius: '4px',
                          width: '26px',
                          height: '26px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <PlusIcon size={13} />
                      </button>
                      <button
                        onClick={() => removeRow(idx)}
                        title="Supprimer cette ligne"
                        style={{
                          color: 'var(--danger)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <TrashIcon size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom add row strip */}
      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button onClick={() => addEmptyRows(1)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PlusIcon size={14} /> Ajouter 1 ligne
        </button>
        <button onClick={() => addEmptyRows(10)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PlusIcon size={14} /> Ajouter 10 lignes
        </button>
        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--gray-400)' }}>
          {rows.filter(r => r.name.trim()).length} / {rows.length} rempli(s)
        </span>
      </div>
    </div>
  )
}
