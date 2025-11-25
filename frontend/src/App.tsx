import { useState, useEffect } from 'react'
import axios from 'axios'
import { Book, User, ArrowRightLeft, Plus, Trash2, CheckCircle, XCircle, LayoutDashboard } from 'lucide-react'

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
  const [loading, setLoading] = useState(false)

  const [activeTab, setActiveTab] = useState<'dashboard' | 'livros' | 'usuarios'>('dashboard')

  const [novoLivro, setNovoLivro] = useState({ titulo: '', autor: '', isbn: '' })
  const [novoUsuario, setNovoUsuario] = useState({ nome: '', email: '' })
  const [emprestimo, setEmprestimo] = useState({ usuarioId: '', livroId: '' })

  useEffect(() => {
    carregarTudo()
  }, [])

  async function carregarTudo() {
    setLoading(true)
    try {
      const [resLivros, resUsuarios] = await Promise.all([
        axios.get('http://localhost:3333/livros'),
        axios.get('http://localhost:3333/usuarios')
      ])
      setLivros(resLivros.data)
      setUsuarios(resUsuarios.data)
    } catch (error) {
      console.error("Erro ao carregar", error)
    } finally {
      setLoading(false)
    }
  }

  async function cadastrarLivro(e: React.FormEvent) {
    e.preventDefault()
    try {
      await axios.post('http://localhost:3333/livros', novoLivro)
      setNovoLivro({ titulo: '', autor: '', isbn: '' })
      carregarTudo()
      alert("Livro salvo com sucesso!")
    } catch (error) {
      alert('Erro ao cadastrar livro')
    }
  }

  async function cadastrarUsuario(e: React.FormEvent) {
    e.preventDefault()
    try {
      await axios.post('http://localhost:3333/usuarios', novoUsuario)
      setNovoUsuario({ nome: '', email: '' })
      carregarTudo()
      alert("Usuário salvo com sucesso!")
    } catch (error) {
      alert('Erro ao cadastrar usuário')
    }
  }

  async function realizarEmprestimo(e: React.FormEvent) {
    e.preventDefault()
    if (!emprestimo.usuarioId || !emprestimo.livroId) return

    try {
      await axios.post('http://localhost:3333/emprestimos', {
        usuarioId: Number(emprestimo.usuarioId),
        livroId: Number(emprestimo.livroId)
      })
      setEmprestimo({ usuarioId: '', livroId: '' })
      carregarTudo()
      alert("Empréstimo realizado!")
    } catch (error) {
      alert('Erro: Livro indisponível ou erro no servidor.')
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-4 shadow-xl">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Book className="text-blue-400" /> Biblio<span className="text-blue-400">Tech</span>
        </h1>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20} /> Empréstimos & Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('livros')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'livros' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <Book size={20} /> Gerenciar Livros
          </button>
          
          <button 
            onClick={() => setActiveTab('usuarios')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'usuarios' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <User size={20} /> Gerenciar Usuários
          </button>
        </nav>
        
        <div className="text-xs text-slate-500 mt-auto pt-4 border-t border-slate-800">
          Sistema v1.0 • Trabalho BD
        </div>
      </aside>

      {/* Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* VIEW: DASHBOARD & EMPRÉSTIMOS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Painel de Controle</h2>
            
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total de Livros</p>
                    <h3 className="text-3xl font-bold text-slate-800">{livros.length}</h3>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Book size={24} /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Usuários Ativos</p>
                    <h3 className="text-3xl font-bold text-slate-800">{usuarios.length}</h3>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg text-green-600"><User size={24} /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Livros Emprestados</p>
                    <h3 className="text-3xl font-bold text-slate-800">{livros.filter(l => !l.disponivel).length}</h3>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><ArrowRightLeft size={24} /></div>
                </div>
              </div>
            </div>

            {/* Empréstimo */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-blue-600" /> Novo Empréstimo
              </h3>
              <form onSubmit={realizarEmprestimo} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Usuário</label>
                  <select 
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={emprestimo.usuarioId}
                    onChange={e => setEmprestimo({...emprestimo, usuarioId: e.target.value})}
                    required
                  >
                    <option value="">Selecione o Usuário...</option>
                    {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Livro Disponível</label>
                  <select 
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={emprestimo.livroId}
                    onChange={e => setEmprestimo({...emprestimo, livroId: e.target.value})}
                    required
                  >
                    <option value="">Selecione o Livro...</option>
                    {livros.filter(l => l.disponivel).map(l => (
                      <option key={l.id} value={l.id}>{l.titulo} - {l.autor}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                  Confirmar
                </button>
              </form>
            </div>
            
            {/* Lista de Indisponíveis */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-4 border-b border-slate-100 bg-slate-50">
                 <h3 className="font-semibold text-slate-700">Livros Atualmente Emprestados</h3>
               </div>
               <table className="w-full text-sm text-left">
                 <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                   <tr>
                     <th className="px-6 py-3">Título</th>
                     <th className="px-6 py-3">Autor</th>
                     <th className="px-6 py-3">Status</th>
                   </tr>
                 </thead>
                 <tbody>
                    {livros.filter(l => !l.disponivel).map(l => (
                      <tr key={l.id} className="border-b hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium">{l.titulo}</td>
                        <td className="px-6 py-4">{l.autor}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Emprestado</span>
                        </td>
                      </tr>
                    ))}
                    {livros.filter(l => !l.disponivel).length === 0 && (
                      <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Nenhum livro emprestado no momento.</td></tr>
                    )}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {/* VIEW: LIVROS */}
        {activeTab === 'livros' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Gerenciar Acervo</h2>
             </div>

             {/* Cadastro */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="font-semibold mb-4 text-slate-700">Cadastrar Novo Livro</h3>
               <form onSubmit={cadastrarLivro} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Título</label>
                    <input className="w-full p-2 border rounded mt-1" value={novoLivro.titulo} onChange={e => setNovoLivro({...novoLivro, titulo: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Autor</label>
                    <input className="w-full p-2 border rounded mt-1" value={novoLivro.autor} onChange={e => setNovoLivro({...novoLivro, autor: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">ISBN</label>
                    <input className="w-full p-2 border rounded mt-1" value={novoLivro.isbn} onChange={e => setNovoLivro({...novoLivro, isbn: e.target.value})} required />
                  </div>
                  <button type="submit" className="bg-green-600 text-white p-2 rounded hover:bg-green-700 font-medium">Salvar</button>
               </form>
             </div>

             {/* Tabela de Livros */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                   <tr>
                     <th className="px-6 py-3">ID</th>
                     <th className="px-6 py-3">Título</th>
                     <th className="px-6 py-3">Autor</th>
                     <th className="px-6 py-3">ISBN</th>
                     <th className="px-6 py-3">Status</th>
                   </tr>
                 </thead>
                 <tbody>
                   {livros.map(l => (
                     <tr key={l.id} className="border-b hover:bg-slate-50">
                       <td className="px-6 py-4 text-slate-500">#{l.id}</td>
                       <td className="px-6 py-4 font-bold text-slate-700">{l.titulo}</td>
                       <td className="px-6 py-4">{l.autor}</td>
                       <td className="px-6 py-4 font-mono text-xs">{l.isbn}</td>
                       <td className="px-6 py-4">
                         {l.disponivel 
                           ? <span className="flex items-center gap-1 text-green-600 font-medium"><CheckCircle size={14} /> Disponível</span>
                           : <span className="flex items-center gap-1 text-red-500 font-medium"><XCircle size={14} /> Emprestado</span>
                         }
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
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Gerenciar Usuários</h2>
             
             {/* Cadastro */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="font-semibold mb-4 text-slate-700">Cadastrar Novo Leitor</h3>
               <form onSubmit={cadastrarUsuario} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Nome Completo</label>
                    <input className="w-full p-2 border rounded mt-1" value={novoUsuario.nome} onChange={e => setNovoUsuario({...novoUsuario, nome: e.target.value})} required />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
                    <input type="email" className="w-full p-2 border rounded mt-1" value={novoUsuario.email} onChange={e => setNovoUsuario({...novoUsuario, email: e.target.value})} required />
                  </div>
                  <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-medium">Salvar</button>
               </form>
             </div>

             {/* Lista */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {usuarios.map(u => (
                 <div key={u.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
                   <div className="bg-slate-100 p-3 rounded-full text-slate-600">
                     <User size={24} />
                   </div>
                   <div>
                     <p className="font-bold text-slate-800">{u.nome}</p>
                     <p className="text-sm text-slate-500">{u.email}</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default App