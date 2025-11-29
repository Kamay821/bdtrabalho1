import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Book, 
  User, 
  ArrowRightLeft, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  LayoutDashboard,
  LogOut,
  Library
} from 'lucide-react'

interface Livro {
  id: number;
  titulo: string;
  autor: string;
  isbn: string;
  disponivel: boolean;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

function App() {
  const [livros, setLivros] = useState<Livro[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'livros' | 'usuarios'>('dashboard')
  const [isLoading, setIsLoading] = useState(false)

  const [novoLivro, setNovoLivro] = useState({ titulo: '', autor: '', isbn: '' })
  const [novoUsuario, setNovoUsuario] = useState({ nome: '', email: '' })
  const [emprestimo, setEmprestimo] = useState({ usuarioId: '', livroId: '' })

  useEffect(() => {
    carregarTudo()
  }, [])


  async function carregarTudo() {
    setIsLoading(true)
    try {
      const [resLivros, resUsuarios] = await Promise.all([
        axios.get('http://localhost:3333/livros'),
        axios.get('http://localhost:3333/usuarios')
      ])
      setLivros(resLivros.data)
      setUsuarios(resUsuarios.data)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      alert("Erro ao conectar com o servidor. Verifique se o backend está rodando.")
    } finally {
      setIsLoading(false)
    }
  }

  async function cadastrarLivro(e: React.FormEvent) {
    e.preventDefault()
    try {
      await axios.post('http://localhost:3333/livros', novoLivro)
      setNovoLivro({ titulo: '', autor: '', isbn: '' })
      await carregarTudo()
      alert("Livro cadastrado com sucesso!")
    } catch (error) {
      alert('Erro ao cadastrar livro. Verifique os dados.')
    }
  }

  async function cadastrarUsuario(e: React.FormEvent) {
    e.preventDefault()
    try {
      await axios.post('http://localhost:3333/usuarios', novoUsuario)
      setNovoUsuario({ nome: '', email: '' })
      await carregarTudo()
      alert("Usuário cadastrado com sucesso!")
    } catch (error) {
      alert('Erro ao cadastrar usuário.')
    }
  }

  async function realizarEmprestimo(e: React.FormEvent) {
    e.preventDefault()
    if (!emprestimo.usuarioId || !emprestimo.livroId) return alert('Selecione Usuário e Livro.')

    try {
      await axios.post('http://localhost:3333/emprestimos', {
        usuarioId: Number(emprestimo.usuarioId),
        livroId: Number(emprestimo.livroId)
      })
      setEmprestimo({ usuarioId: '', livroId: '' })
      await carregarTudo()
      alert("Empréstimo realizado com sucesso!")
    } catch (error) {
      alert('Erro: Livro indisponível ou dados inválidos.')
    }
  }

  async function devolverLivro(livroId: number) {
    if (!confirm("Confirmar a devolução deste livro?")) return

    try {
      await axios.patch(`http://localhost:3333/livros/${livroId}/devolver`)
      await carregarTudo()
      alert("Livro devolvido com sucesso!")
    } catch (error) {
      alert("Erro ao processar devolução.")
    }
  }

  async function excluirLivro(id: number) {
    if (!confirm("Tem certeza que deseja excluir este livro permanentemente?")) return

    try {
      await axios.delete(`http://localhost:3333/livros/${id}`)
      await carregarTudo()
      alert("Livro excluído com sucesso!")
    } catch (error: any) {
      if (error.response?.data?.msg) {
        alert(error.response.data.msg)
      } else {
        alert("Erro ao excluir livro.")
      }
    }
  }


  return (
    <div className="min-h-screen flex bg-slate-100 font-sans text-slate-900">
      
      {/* --- SIDEBAR LATERAL --- */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-10">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Library className="text-blue-400" /> Biblio<span className="text-blue-400">Tech</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-blue-600 shadow-lg translate-x-1' : 'hover:bg-slate-800 text-slate-300 hover:text-white'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('livros')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'livros' ? 'bg-blue-600 shadow-lg translate-x-1' : 'hover:bg-slate-800 text-slate-300 hover:text-white'}`}
          >
            <Book size={20} /> Acervo de Livros
          </button>
          
          <button 
            onClick={() => setActiveTab('usuarios')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'usuarios' ? 'bg-blue-600 shadow-lg translate-x-1' : 'hover:bg-slate-800 text-slate-300 hover:text-white'}`}
          >
            <User size={20} /> Leitores
          </button>
        </nav>
        
        <div className="p-4 text-xs text-slate-500 border-t border-slate-800 text-center">
          SBD - Trabalho 1 • 2025
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        
        {/* VIEW: DASHBOARD & EMPRÉSTIMOS */}
        {activeTab === 'dashboard' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header>
              <h2 className="text-3xl font-bold text-slate-800">Painel de Controle</h2>
              <p className="text-slate-500">Visão geral e gerenciamento de empréstimos.</p>
            </header>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Livros</p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1">{livros.length}</h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Book size={28} /></div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Leitores</p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1">{usuarios.length}</h3>
                </div>
                <div className="p-3 bg-green-50 text-green-600 rounded-full"><User size={28} /></div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Emprestados</p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1">{livros.filter(l => !l.disponivel).length}</h3>
                </div>
                <div className="p-3 bg-orange-50 text-orange-600 rounded-full"><ArrowRightLeft size={28} /></div>
              </div>
            </div>

            {/* Seção de Novo Empréstimo */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b">
                <Plus className="text-blue-600" /> Registrar Novo Empréstimo
              </h3>
              <form onSubmit={realizarEmprestimo} className="flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Selecione o Leitor</label>
                  <select 
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 outline-none transition-all"
                    value={emprestimo.usuarioId}
                    onChange={e => setEmprestimo({...emprestimo, usuarioId: e.target.value})}
                    required
                  >
                    <option value="">Escolha um usuário...</option>
                    {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Selecione o Livro (Disponíveis)</label>
                  <select 
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 outline-none transition-all"
                    value={emprestimo.livroId}
                    onChange={e => setEmprestimo({...emprestimo, livroId: e.target.value})}
                    required
                  >
                    <option value="">Escolha um livro...</option>
                    {livros.filter(l => l.disponivel).map(l => (
                      <option key={l.id} value={l.id}>{l.titulo} - {l.autor}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center gap-2 justify-center">
                  <CheckCircle size={18} /> Confirmar Empréstimo
                </button>
              </form>
            </div>
            
            {/* Tabela de Empréstimos Ativos */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                 <h3 className="font-bold text-slate-700 flex items-center gap-2">
                   <ArrowRightLeft size={18} className="text-orange-500" /> Livros Atualmente Emprestados
                 </h3>
                 <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                   {livros.filter(l => !l.disponivel).length} itens
                 </span>
               </div>
               <table className="w-full text-sm text-left">
                 <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                   <tr>
                     <th className="px-6 py-4 font-semibold">Título do Livro</th>
                     <th className="px-6 py-4 font-semibold">Autor</th>
                     <th className="px-6 py-4 font-semibold">Situação</th>
                     <th className="px-6 py-4 font-semibold text-right">Ações</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {livros.filter(l => !l.disponivel).map(l => (
                      <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">{l.titulo}</td>
                        <td className="px-6 py-4 text-slate-600">{l.autor}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Emprestado
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => devolverLivro(l.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-600 rounded-md text-xs font-medium transition-all shadow-sm"
                            title="Registrar devolução do livro"
                          >
                            <LogOut size={14} /> Devolver
                          </button>
                        </td>
                      </tr>
                    ))}
                    {livros.filter(l => !l.disponivel).length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic bg-slate-50/50">
                          Nenhum livro emprestado no momento. Todo o acervo está disponível.
                        </td>
                      </tr>
                    )}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {/* VIEW: LIVROS */}
        {activeTab === 'livros' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
             <header className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">Gerenciar Acervo</h2>
                  <p className="text-slate-500">Cadastre, visualize e remova livros.</p>
                </div>
             </header>

             {/* Formulário de Cadastro */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="font-semibold mb-4 text-slate-700 flex items-center gap-2">
                 <Plus size={18} /> Cadastrar Novo Livro
               </h3>
               <form onSubmit={cadastrarLivro} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="md:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Título</label>
                    <input className="w-full p-2.5 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Dom Casmurro" value={novoLivro.titulo} onChange={e => setNovoLivro({...novoLivro, titulo: e.target.value})} required />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Autor</label>
                    <input className="w-full p-2.5 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Machado de Assis" value={novoLivro.autor} onChange={e => setNovoLivro({...novoLivro, autor: e.target.value})} required />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">ISBN</label>
                    <input className="w-full p-2.5 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: 978-000000" value={novoLivro.isbn} onChange={e => setNovoLivro({...novoLivro, isbn: e.target.value})} required />
                  </div>
                  <button type="submit" className="bg-green-600 text-white p-2.5 rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm flex items-center justify-center gap-2">
                    <Plus size={18} /> Salvar
                  </button>
               </form>
             </div>

             {/* Tabela Completa */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 uppercase text-xs border-b">
                   <tr>
                     <th className="px-6 py-3 w-16">ID</th>
                     <th className="px-6 py-3">Título</th>
                     <th className="px-6 py-3">Autor</th>
                     <th className="px-6 py-3">ISBN</th>
                     <th className="px-6 py-3">Status</th>
                     <th className="px-6 py-3 text-right">Ações</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {livros.map(l => (
                     <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-6 py-4 text-slate-400 font-mono text-xs">#{l.id}</td>
                       <td className="px-6 py-4 font-bold text-slate-700">{l.titulo}</td>
                       <td className="px-6 py-4 text-slate-600">{l.autor}</td>
                       <td className="px-6 py-4 font-mono text-xs text-slate-500">{l.isbn}</td>
                       <td className="px-6 py-4">
                         {l.disponivel 
                           ? <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} /> Disponível</span>
                           : <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle size={12} /> Emprestado</span>
                         }
                       </td>
                       <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => excluirLivro(l.id)}
                           className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                           title="Excluir livro permanentemente"
                         >
                           <Trash2 size={18} />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* VIEW: USUÁRIOS */}
        {activeTab === 'usuarios' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
             <header>
                <h2 className="text-3xl font-bold text-slate-800">Leitores Cadastrados</h2>
                <p className="text-slate-500">Gerenciamento de usuários da biblioteca.</p>
             </header>
             
             {/* Cadastro */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="font-semibold mb-4 text-slate-700 flex items-center gap-2">
                 <Plus size={18} /> Novo Leitor
               </h3>
               <form onSubmit={cadastrarUsuario} className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nome Completo</label>
                    <input className="w-full p-2.5 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Carlos Abreu" value={novoUsuario.nome} onChange={e => setNovoUsuario({...novoUsuario, nome: e.target.value})} required />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email</label>
                    <input type="email" className="w-full p-2.5 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: carlos@email.com" value={novoUsuario.email} onChange={e => setNovoUsuario({...novoUsuario, email: e.target.value})} required />
                  </div>
                  <button type="submit" className="w-full md:w-auto px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm flex items-center justify-center gap-2">
                    <Plus size={18} /> Cadastrar
                  </button>
               </form>
             </div>

             {/* Grid de Usuários */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {usuarios.map(u => (
                 <div key={u.id} className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow group">
                   <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                     <User size={24} />
                   </div>
                   <div className="overflow-hidden">
                     <p className="font-bold text-slate-800 truncate">{u.nome}</p>
                     <p className="text-sm text-slate-500 truncate">{u.email}</p>
                     <p className="text-xs text-slate-400 mt-1">ID: {u.id}</p>
                   </div>
                 </div>
               ))}
               {usuarios.length === 0 && (
                 <p className="text-slate-500 col-span-3 text-center py-10">Nenhum usuário cadastrado.</p>
               )}
             </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default App