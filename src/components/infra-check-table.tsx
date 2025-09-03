"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getHousesAction } from "@/app/actions/get-houses.action"
import { getOffertsAction } from "@/app/actions/get-offerts.action"
import { House } from "@/lib/types/house.types"
import { Offert } from "@/lib/types/offert.types"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type Row = {
    id: string
    chat_id: string
    address: string
    city: string
    rooms: number
    mts: number
    strate: number
    ceilingScore: number
    floorScore: number
    finishedScore: number
    offerStart?: number | null
    offerEnd?: number | null
    offerAccepted?: boolean | null
    detail?: string
}

export function InfraCheckTable() {
    const [rows, setRows] = React.useState<Row[]>([])
    const [selected, setSelected] = React.useState<Row | null>(null)
    const [showMd, setShowMd] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [city, setCity] = React.useState("all")
    const [minScore, setMinScore] = React.useState(0)

    React.useEffect(() => {
        (async () => {
            const res = await getHousesAction({ page: 1, limit: 100 })
            const houses = res.isOk ? res.data : []
            const offRes = await getOffertsAction({ page: 1, limit: 200 })
            const offerts = offRes.isOk ? offRes.data : []

            const offertsByChat = new Map<string, Offert[]>()
            offerts.forEach((o) => {
                const arr = offertsByChat.get(o.chat_id) ?? []
                arr.push(o)
                offertsByChat.set(o.chat_id, arr)
            })

            const pickOffer = (chatId: string): { offerStart: number | null, offerEnd: number | null, offerAccepted: boolean | null, detail?: string } => {
                const list = offertsByChat.get(chatId)
                if (!list || list.length === 0) return { offerStart: null, offerEnd: null, offerAccepted: null }
                const accepted = list.find(o => o.accepted)
                const chosen = accepted ?? list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
                return { offerStart: chosen.startRange, offerEnd: chosen.endRange, offerAccepted: chosen.accepted, detail: chosen.detail }
            }

            const mapped: Row[] = houses.map((h: House) => {
                const offer = pickOffer(h.chat_id)
                return {
                    id: h.id,
                    chat_id: h.chat_id,
                    address: h.address,
                    city: h.city,
                    rooms: h.rooms,
                    mts: h.mts,
                    strate: h.strate,
                    ceilingScore: h.ceilingScore,
                    floorScore: h.floorScore,
                    finishedScore: h.finishedScore,
                    ...offer,
                }
            })
            setRows(mapped)
        })()
    }, [])

    React.useEffect(() => {
        setShowMd(false)
    }, [selected])

    const getGeneral = (r: Row) => Math.round((r.ceilingScore + r.floorScore + r.finishedScore) / 3)
    const scoreBadge = (v: number) => {
        if (v >= 8) return "bg-[#007524]/17 text-[#007524]"
        if (v >= 6) return "bg-[#feb204]/17 text-[#feb204]"
        if (v >= 4) return "bg-[#F86B14]/17 text-[#F86B14]"
        return "bg-[#D01A1A]/17 text-[#D01A1A]"
    }
    const scoreLabel = (v: number) => {
        if (v >= 8) return "Alta"
        if (v >= 6) return "Media"
        if (v >= 4) return "Baja"
        return "Crítica"
    }

    const cities = React.useMemo(() => Array.from(new Set(rows.map(r => r.city))).sort(), [rows])
    const filtered = rows.filter(r => {
        const matchQuery = `${r.address} ${r.city}`.toLowerCase().includes(query.toLowerCase())
        const matchCity = city === 'all' ? true : r.city === city
        const matchScore = getGeneral(r) >= minScore
        return matchQuery && matchCity && matchScore
    })

    return (
        <Card className="border-0 shadow-none">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-6">
                    <div>
                        <CardTitle className="text-2xl tracking-tight">Infraestructura de Propiedades</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Explora la salud estructural y acabados de cada propiedad.</p>
                    </div>
                </div>
                <div className="mt-4 flex items-center gap-2 w-full max-w-4xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input className="pl-9" placeholder="Buscar dirección o ciudad" value={query} onChange={(e) => setQuery(e.target.value)} />
                    </div>
                    <Select value={city} onValueChange={setCity}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Ciudad" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Score ≥</span>
                        <Input type="number" min={0} max={10} value={minScore} onChange={(e) => setMinScore(Number(e.target.value) || 0)} className="w-16" />
                    </div>
                    <Button variant="outline" onClick={() => { setQuery(''); setCity('all'); setMinScore(0) }}>Limpiar</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((r) => (
                        <div key={r.id} className="relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md cursor-pointer ring-1 ring-transparent hover:ring-[#1482F8]/20" onClick={() => setSelected(r)}>
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1482F8] via-transparent to-transparent opacity-70" />
                            <div className="font-medium mb-1 line-clamp-1">{r.address}</div>
                            <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">{r.city}</span>
                                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">Estrato {r.strate}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                                <div>
                                    <div className="text-gray-600">Hab.</div>
                                    <div className="font-medium">{r.rooms}</div>
                                </div>
                                <div>
                                    <div className="text-gray-600">M²</div>
                                    <div className="font-medium">{r.mts}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`px-2 py-0.5 rounded text-xs font-medium ${scoreBadge(getGeneral(r))}`}>{scoreLabel(getGeneral(r))}</div>
                                <div className="text-xs text-muted-foreground w-8">{getGeneral(r)}/10</div>
                                <div className="w-full h-2 bg-gray-100 rounded-full">
                                    <div className="h-2 bg-[#1482F8] rounded-full" style={{ width: `${(getGeneral(r) / 10) * 100}%` }} />
                                </div>
                            </div>
                        </div>
                    ))}
                    {!filtered.length && (
                        <div className="col-span-full text-center text-gray-500 py-8">Sin resultados</div>
                    )}
                </div>

                <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Detalle de propiedad</DialogTitle>
                        </DialogHeader>
                        {selected && (
                            <div className="space-y-6">
                                <div className="rounded-lg border p-4 bg-white">
                                    <div className="mb-2 text-sm text-gray-600">Oferta de precio</div>
                                    {selected.offerStart != null && selected.offerEnd != null ? (
                                        <div className="flex items-center gap-2">
                                            <div className="text-base font-semibold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(selected.offerStart)} - {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(selected.offerEnd)}</div>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${selected.offerAccepted ? 'bg-[#007524]/17 text-[#007524]' : 'bg-[#feb204]/17 text-[#feb204]'}`}>{selected.offerAccepted ? 'Aceptada' : 'Pendiente'}</span>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">Sin oferta registrada</div>
                                    )}
                                    {selected.detail && (
                                        <div className="mt-3 rounded-lg border border-[#1482F8]/30 bg-[#1482F8]/5 p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs font-medium text-[#1482F8]">Detalle de la oferta</div>
                                                <Button size="sm" variant="outline" onClick={() => setShowMd(!showMd)}>
                                                    {showMd ? 'Ocultar' : 'Ver detalle'}
                                                </Button>
                                            </div>
                                            {showMd && (
                                                <div className="mt-3 max-h-64 overflow-auto pr-1 prose prose-sm max-w-none text-gray-800">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{selected.detail}</ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="rounded-lg border p-4 bg-white">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-gray-600">Dirección</div>
                                            <div className="font-medium">{selected.address}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Ciudad</div>
                                            <div className="font-medium">{selected.city}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Habitaciones</div>
                                            <div className="font-medium">{selected.rooms}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">M²</div>
                                            <div className="font-medium">{selected.mts}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Estrato</div>
                                            <div className="font-medium">{selected.strate}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { label: 'Techo', value: selected.ceilingScore },
                                        { label: 'Piso', value: selected.floorScore },
                                        { label: 'Acabados', value: selected.finishedScore },
                                        { label: 'General', value: getGeneral(selected) },
                                    ].map((item) => (
                                        <div key={item.label} className="rounded-lg border p-4">
                                            <div className="mb-2 text-sm text-gray-600">{item.label}</div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                                                    <div className="h-2 bg-[#1482F8] rounded-full" style={{ width: `${(item.value / 10) * 100}%` }} />
                                                </div>
                                                <div className={`px-2 py-0.5 rounded text-xs font-medium ${scoreBadge(item.value)}`}>{item.value}/10</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}


