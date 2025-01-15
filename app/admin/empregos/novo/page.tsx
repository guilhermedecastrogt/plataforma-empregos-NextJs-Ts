"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Ramo = {
    id: number;
    nome: string;
};

type Regiao = {
    id: number;
    nome: string;
};

export default function CreateEmpregoPage() {
    const router = useRouter();

    const [titulo, setTitulo] = useState("");
    const [tipoVaga, setTipoVaga] = useState("clt");
    const [experiencia, setExperiencia] = useState("comExperiencia");
    const [localizacao, setLocalizacao] = useState("");
    const [imagemFile, setImagemFile] = useState<File | null>(null);
    const [ramoId, setRamoId] = useState("");
    const [regiaoId, setRegiaoId] = useState("");

    const [ramos, setRamos] = useState<Ramo[]>([]);
    const [regioes, setRegioes] = useState<Regiao[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const ramoRes = await fetch("/api/admin/ramos");
            const regiaoRes = await fetch("/api/admin/regioes");

            if (!ramoRes.ok || !regiaoRes.ok) {
                throw new Error("Erro ao carregar ramos ou regiões.");
            }

            setRamos(await ramoRes.json());
            setRegioes(await regiaoRes.json());
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            alert("Erro ao carregar ramos e regiões.");
        }
    }

    async function handleImageUpload(file: File): Promise<string> {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/admin/empregos/uploadImage", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Erro ao fazer upload:", errorData);
                throw new Error(errorData.error || "Erro ao fazer upload da imagem");
            }

            const data = await response.json();
            console.log("URL da imagem:", data.url);
            return data.url;
        } catch (error) {
            console.error("Erro ao enviar imagem:", error);
            throw error;
        }
    }


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!titulo || !tipoVaga || !experiencia || !localizacao || !imagemFile || !ramoId || !regiaoId) {
            alert("Todos os campos são obrigatórios.");
            return;
        }

        try {
            const imageUrl = await handleImageUpload(imagemFile); // Faz upload da imagem

            const payload = {
                titulo,
                tipoVaga,
                experiencia,
                localizacao,
                imagem: imageUrl, // Usa a URL da imagem retornada pelo servidor
                ramoId,
                regiaoId,
            };

            const res = await fetch("/api/admin/empregos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Erro ao criar emprego.");
            }

            alert("Emprego criado com sucesso!");
            router.push("/admin/empregos");
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Erro ao criar emprego.");
        }
    }


    return (
        <div className="max-w-2xl mx-auto p-8 bg-white shadow-md rounded">
            <h1 className="text-2xl font-bold mb-6">Criar Emprego</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Título */}
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Título</label>
                    <input
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                    />
                </div>

                {/* Tipo de Vaga */}
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Tipo de Vaga</label>
                    <select
                        value={tipoVaga}
                        onChange={(e) => setTipoVaga(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                        <option value="clt">CLT</option>
                        <option value="pj">PJ</option>
                        <option value="temporario">Temporário</option>
                    </select>
                </div>

                {/* Experiência */}
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Experiência</label>
                    <select
                        value={experiencia}
                        onChange={(e) => setExperiencia(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                        <option value="comExperiencia">Com Experiência</option>
                        <option value="semExperiencia">Sem Experiência</option>
                    </select>
                </div>

                {/* Localização */}
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Localização</label>
                    <input
                        type="text"
                        value={localizacao}
                        onChange={(e) => setLocalizacao(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                    />
                </div>

                {/* Upload de Imagem */}
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Imagem</label>
                    <input
                        type="file"
                        onChange={(e) => setImagemFile(e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        accept="image/*"
                        required
                    />
                </div>

                {/* Ramo */}
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Ramo</label>
                    <select
                        value={ramoId}
                        onChange={(e) => setRamoId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                        <option value="">Selecione um ramo</option>
                        {ramos.map((ramo) => (
                            <option key={ramo.id} value={ramo.id}>
                                {ramo.nome}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Região */}
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Região</label>
                    <select
                        value={regiaoId}
                        onChange={(e) => setRegiaoId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                        <option value="">Selecione uma região</option>
                        {regioes.map((regiao) => (
                            <option key={regiao.id} value={regiao.id}>
                                {regiao.nome}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Botão de criar emprego */}
                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Criar Emprego
                </button>
            </form>
        </div>
    );
}