"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Briefcase } from "lucide-react"
import Image from "next/image"

type Emprego = {
  id: number
  titulo: string
  localizacao: string
  tipoVaga: string
  ramo: string
  regiao: string
  imagem: string
}

type Regiao = {
  nome: string
  slug: string
}

type Ramo = {
  nome: string
  slug: string
}

const ITEMS_PER_PAGE = 10

export default function MobileJobFeed() {
  const [empregos, setEmpregos] = useState<Emprego[]>([])
  const [regioes, setRegioes] = useState<Regiao[]>([])
  const [ramos, setRamos] = useState<Ramo[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [hasMore, setHasMore] = useState(true)

  const observer = useRef<IntersectionObserver | null>(null)
  const lastJobElementRef = useCallback(
      (node: HTMLDivElement | null) => {
        if (loading) return
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prevPage) => prevPage + 1)
          }
        })
        if (node) observer.current.observe(node)
      },
      [loading, hasMore],
  )

  useEffect(() => {
    fetchRegioes()
    fetchRamos()
  }, [])

  useEffect(() => {
    fetchEmpregos()
  }, [page, searchTerm, selectedLocation, selectedType])

  async function fetchEmpregos() {
    try {
      let selectedLocationAtt = selectedLocation || ""
      if (selectedLocation === "all"){
        selectedLocationAtt = "";
      }
      let selectedTypeAtt = selectedType || ""
      if (selectedType === "all"){
        selectedTypeAtt = ""
      }
      setLoading(true)
      const params = new URLSearchParams({
        search: searchTerm,
        regiao: selectedLocationAtt,
        ramo: selectedTypeAtt,
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      })
      console.log("params", params.toString())
      const response = await fetch(`/api/empregos/filtrar/mobile?${params}`)
      if (!response.ok) {
        throw new Error("Erro ao carregar os empregos.")
      }
      const data: Emprego[] = await response.json()
      if (data.length < ITEMS_PER_PAGE) {
        setHasMore(false)
      }
      setEmpregos((prevEmpregos) => (page === 1 ? data : [...prevEmpregos, ...data]))
      setLoading(false)
    } catch (error) {
      console.error(error)
      alert("Erro ao carregar empregos.")
      setLoading(false)
    }
  }

  async function fetchRegioes() {
    try {
      const response = await fetch("/api/empregos/regioes")
      if (!response.ok) {
        throw new Error("Erro ao carregar as regiões.")
      }
      const data: Regiao[] = await response.json()
      setRegioes(data)
    } catch (error) {
      console.error(error)
      alert("Erro ao carregar regiões.")
    }
  }

  async function fetchRamos() {
    try {
      const response = await fetch("/api/empregos/ramos")
      if (!response.ok) {
        throw new Error("Erro ao carregar os ramos.")
      }
      const data: Ramo[] = await response.json()
      setRamos(data)
    } catch (error) {
      console.error(error)
      alert("Erro ao carregar ramos.")
    }
  }

  function handleFilter() {
    setPage(1)
    setEmpregos([])
    setHasMore(true)
  }

  return (
      <div className="bg-white min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-[#f8f8fd] pt-8 pb-6">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-[#202430] mb-2">Seu Emprego Ideal.</h1>
            <h2 className="text-2xl font-bold text-[#26a4ff] mb-4">Há 7 Anos Mudando Vidas!</h2>
            <p className="text-[#515b6f] mb-6">
              Atendemos inúmeras empresas em toda Goiânia e Região; garantindo a maior oferta de vagas nos mais amplos
              setores.
            </p>
            <div className="space-y-4">
              <div className="relative">
                <Input
                    placeholder="Buscar vagas..."
                    className="pl-10 h-12 text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
              <div className="relative">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full h-12 pl-10">
                    <SelectValue placeholder="Local/Região" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as regiões</SelectItem>
                    {regioes.map((regiao) => (
                        <SelectItem key={regiao.slug} value={regiao.slug}>
                          {regiao.nome}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full h-12 pl-10">
                    <SelectValue placeholder="Tipo de vaga" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {ramos.map((ramo) => (
                        <SelectItem key={ramo.slug} value={ramo.slug}>
                          {ramo.nome}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Briefcase className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              <Button className="w-full h-12 bg-[#4640de] hover:bg-[#4640de]/90 text-white" onClick={handleFilter}>
                Buscar
              </Button>
            </div>
          </div>
        </section>

        {/* Job Feed */}
        <div className="container mx-auto px-2 py-6">
          <div className="grid grid-cols-2 gap-4">
            {empregos.map((emprego, index) => (
                <div
                    key={emprego.id}
                    ref={index === empregos.length - 1 ? lastJobElementRef : null}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                >
                  <div className="relative aspect-square">
                    <Image
                        src={emprego.imagem || "/placeholder.svg"}
                        alt={emprego.titulo}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 ease-in-out hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-[#202430] truncate">{emprego.titulo}</h2>
                    <p className="text-sm text-[#515b6f] truncate">{emprego.ramo}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-[#4640de] mr-1" />
                        <span className="text-sm text-[#515b6f]">{emprego.localizacao}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {emprego.tipoVaga}
                      </Badge>
                    </div>
                  </div>
                </div>
            ))}
          </div>
          {loading && (
              <div className="flex justify-center items-center py-4">
                <svg
                    className="animate-spin h-8 w-8 text-[#4640de]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
          )}
          {!loading && !hasMore && empregos.length > 0 && (
              <div className="text-center text-[#515b6f] py-4">Não há mais vagas para carregar.</div>
          )}
          {!loading && empregos.length === 0 && (
              <div className="text-center text-[#515b6f] py-4">Nenhuma vaga encontrada.</div>
          )}
        </div>
      </div>
  )
}