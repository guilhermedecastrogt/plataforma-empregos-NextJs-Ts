"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Briefcase, Filter } from "lucide-react";
import Image from "next/image";

type Emprego = {
  id: number;
  titulo: string;
  localizacao: string;
  tipoVaga: string;
  ramo: string;
  regiao: string;
  imagem: string;
};

type Regiao = {
  nome: string;
  slug: string;
};

type Ramo = {
  nome: string;
  slug: string;
};

export default function JobListings() {
  const [empregos, setEmpregos] = useState<Emprego[]>([]);
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [ramos, setRamos] = useState<Ramo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    fetchEmpregos();
    fetchRegioes();
    fetchRamos();
  }, []);

  async function fetchEmpregos(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      console.log("Parametros da url string:", params);
      const response = await fetch(`/api/empregos/filtrar?${params}`);
      if (!response.ok) {
        throw new Error("Erro ao carregar os empregos.");
      }
      const data: Emprego[] = await response.json();

      setEmpregos(data);

      console.log("Empregos retornados:", data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar empregos.");
    }
  }

  async function fetchRegioes() {
    try {
      const response = await fetch(`/api/empregos/regioes`);
      if (!response.ok) {
        throw new Error("Erro ao carregar as regiões.");
      }
      const data: Regiao[] = await response.json();

      setRegioes(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar regiões.");
    }
  }

  async function fetchRamos() {
    try {
      const response = await fetch(`/api/empregos/ramos`);
      if (!response.ok) {
        throw new Error("Erro ao carregar os ramos.");
      }
      const data: Ramo[] = await response.json();

      setRamos(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar ramos.");
    }
  }

  function handleFilter() {
    const filters = {
      search: searchTerm,
      regiao: selectedLocation,
      ramo: selectedType,
    };

    console.log("Filtros selecionados:", filters);
    fetchEmpregos(filters);
  }

  return (
      <div className="min-h-screen bg-[#f8f8fd]">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-[#202430] mb-8">Todas as vagas</h1>

          {/* Search and Filter Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              {/* Campo de Busca */}
              <div className="relative">
                <Input
                    placeholder="Buscar vagas..."
                    className="pl-10 h-12 text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>

              {/* Filtro por Região */}
              <div className="relative">
                <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full h-12 pl-10 pr-8 border rounded-md bg-white"
                >
                  <option value="">Local/Região</option>
                  {regioes.map((regiao) => (
                      <option key={regiao.slug} value={regiao.slug}>
                        {regiao.nome}
                      </option>
                  ))}
                </select>
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Filtro por Ramo */}
              <div className="relative">
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full h-12 pl-10 pr-8 border rounded-md bg-white"
                >
                  <option value="">Ramos</option>
                  {ramos.map((ramos) => (
                      <option key={ramos.slug} value={ramos.slug}>
                        {ramos.nome}
                      </option>
                  ))}
                </select>
                <Briefcase className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Botão de Filtrar */}
              <Button
                  className="h-12 bg-[#4640de] hover:bg-[#4640de]/90 text-white"
                  onClick={handleFilter}
              >
                <Filter className="mr-2 h-5 w-5" />
                Filtrar
              </Button>
            </div>
          </div>

          {/* Job Listings */}
          <div className="space-y-4">
            {empregos.map((job) => (
                <div
                    key={job.id}
                    className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start">
                    <Image
                        src={job.imagem || "/placeholder.svg"}
                        alt={job.titulo}
                        width={64}
                        height={64}
                        className="rounded-lg mr-4"
                    />
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-[#202430]">{job.titulo}</h2>
                      <p className="text-[#515b6f]">
                        {job.ramo} • {job.localizacao}
                      </p>
                      <div className="flex items-center mt-2">
                        <Badge variant="secondary" className="mr-2">
                          {job.tipoVaga.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline">{job.regiao}</Badge>
                      </div>
                    </div>
                    <Button variant="outline" className="ml-4">
                      Ver vaga
                    </Button>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
  );
}
