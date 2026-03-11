'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

export default function InsightsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data());
        setTransactions(data);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const generateInsights = async () => {
    if (transactions.length === 0) {
      setError('Você precisa de algumas transações registradas para gerar insights.');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Chave da API do Gemini não configurada.');
      }

      const ai = new GoogleGenAI({ apiKey });

      // Prepare data for the prompt (limit to last 50 to save tokens and focus on recent)
      const recentTransactions = transactions.slice(0, 50).map(t => ({
        data: t.date.toDate().toLocaleDateString('pt-BR'),
        tipo: t.type === 'income' ? 'Receita' : 'Despesa',
        categoria: t.category,
        valor: t.amount,
        descricao: t.description
      }));

      const prompt = `
        Você é um consultor financeiro pessoal inteligente. Analise as seguintes transações recentes do usuário e forneça insights valiosos.
        
        Transações:
        ${JSON.stringify(recentTransactions, null, 2)}
        
        Por favor, forneça:
        1. Um resumo rápido da saúde financeira atual (baseado nos dados).
        2. Categorias onde o usuário está gastando mais.
        3. 3 dicas práticas e personalizadas de economia baseadas nos hábitos de consumo apresentados.
        4. Um alerta amigável se houver algum padrão de gasto preocupante.
        
        Formate a resposta em Markdown, usando títulos (##), listas e negrito para destacar informações importantes. Seja direto, encorajador e profissional.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setInsights(response.text || 'Não foi possível gerar insights no momento.');
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao gerar os insights. Tente novamente mais tarde.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="p-8">Carregando dados...</div>;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-500" />
            IA Insights
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Receba análises e dicas personalizadas da nossa Inteligência Artificial.</p>
        </div>
        <button
          onClick={generateInsights}
          disabled={analyzing || transactions.length === 0}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm shadow-purple-600/20"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Gerar Nova Análise
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-start gap-3 mb-8">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {!insights && !analyzing && !error && (
        <div className="bg-white dark:bg-zinc-900 p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center shadow-sm">
          <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Descubra o poder dos seus dados</h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-8">
            Nossa IA analisa seus padrões de gastos para encontrar oportunidades de economia e sugerir melhorias na sua vida financeira.
          </p>
          <button
            onClick={generateInsights}
            disabled={transactions.length === 0}
            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3 rounded-full font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            Analisar Minhas Finanças
          </button>
          {transactions.length === 0 && (
            <p className="text-sm text-zinc-500 mt-4">Adicione algumas transações primeiro.</p>
          )}
        </div>
      )}

      {insights && (
        <div className="bg-white dark:bg-zinc-900 p-8 md:p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm prose prose-zinc dark:prose-invert max-w-none">
          <div className="markdown-body">
            <ReactMarkdown>{insights}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
