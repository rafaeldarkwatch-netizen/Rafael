'use client';

import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Wallet, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl tracking-tight">
          <Wallet className="w-6 h-6" />
          <span>Finanças Inteligentes</span>
        </div>
        <button
          onClick={signIn}
          className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2 rounded-full font-medium text-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
        >
          Entrar
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>IA Financeira Integrada</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6 leading-tight">
            Assuma o controle do seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">dinheiro</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto">
            Registre receitas e despesas rapidamente, visualize para onde o dinheiro está indo e receba recomendações automáticas para melhorar sua saúde financeira.
          </p>
          <button
            onClick={signIn}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-medium text-lg transition-colors shadow-lg shadow-indigo-600/20"
          >
            Começar Gratuitamente
          </button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mt-32 max-w-5xl w-full text-left">
          <FeatureCard
            icon={<TrendingUp className="w-6 h-6 text-emerald-500" />}
            title="Dashboard Visual"
            description="Entenda seus gastos com gráficos claros e intuitivos. Saiba exatamente para onde seu dinheiro vai."
          />
          <FeatureCard
            icon={<Sparkles className="w-6 h-6 text-purple-500" />}
            title="Insights com IA"
            description="Nossa inteligência artificial analisa seus dados e fornece dicas personalizadas de economia."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-6 h-6 text-blue-500" />}
            title="Seguro e Privado"
            description="Seus dados estão seguros. Autenticação robusta e banco de dados protegido por regras estritas."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">{title}</h3>
      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}
