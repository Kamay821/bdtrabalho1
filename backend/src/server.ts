import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const app = Fastify()
const prisma = new PrismaClient()

app.register(cors, { 
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
})

app.post('/usuarios', async (request, reply) => {
  const criarUsuarioSchema = z.object({
    nome: z.string(),
    email: z.string().email(),
  })
  
  const { nome, email } = criarUsuarioSchema.parse(request.body)
  
  try {
    const usuario = await prisma.usuario.create({
      data: { nome, email }
    })
    return reply.status(201).send(usuario)
  } catch (error) {
    return reply.status(400).send({ msg: "Erro ao criar usuário. Email já existe?" })
  }
})

app.get('/usuarios', async () => {
  return await prisma.usuario.findMany({
    orderBy: { nome: 'asc' }
  })
})

app.post('/livros', async (request, reply) => {
  const criarLivroSchema = z.object({
    titulo: z.string(),
    autor: z.string(),
    isbn: z.string(),
  })

  const dados = criarLivroSchema.parse(request.body)

  try {
    const livro = await prisma.livro.create({ data: dados })
    return reply.status(201).send(livro)
  } catch (error) {
    return reply.status(400).send({ msg: "Erro ao criar livro. ISBN duplicado?" })
  }
})

app.get('/livros', async () => {
  return await prisma.livro.findMany({
    orderBy: { titulo: 'asc' }
  })
})

app.delete('/livros/:id', async (request, reply) => {
  const paramsSchema = z.object({ id: z.string() })
  const { id } = paramsSchema.parse(request.params)
  const livroId = Number(id)

  try {
    await prisma.livro.delete({
      where: { id: livroId }
    })
    return reply.status(204).send()
  } catch (error) {
    return reply.status(400).send({ 
      msg: "Não é possível excluir este livro pois ele possui histórico de empréstimos registrados." 
    })
  }
})

app.post('/emprestimos', async (request, reply) => {
  const emprestimoSchema = z.object({
    usuarioId: z.number(),
    livroId: z.number(),
  })

  const { usuarioId, livroId } = emprestimoSchema.parse(request.body)

  const livro = await prisma.livro.findUnique({ where: { id: livroId } })
  
  if (!livro) return reply.status(404).send({ msg: "Livro não encontrado" })
  if (!livro.disponivel) return reply.status(400).send({ msg: "Livro indisponível para empréstimo." })

  const resultado = await prisma.$transaction([
    prisma.emprestimo.create({
      data: { usuarioId, livroId }
    }),
    prisma.livro.update({
      where: { id: livroId },
      data: { disponivel: false }
    })
  ])

  return reply.status(201).send(resultado[0])
})

app.patch('/livros/:id/devolver', async (request, reply) => {
  const paramsSchema = z.object({ id: z.string() })
  const { id } = paramsSchema.parse(request.params)
  const livroId = Number(id)

  const emprestimoAtivo = await prisma.emprestimo.findFirst({
    where: { 
      livroId: livroId,
      dataDevolucao: null 
    }
  })

  if (!emprestimoAtivo) {
    return reply.status(404).send({ msg: "Nenhum empréstimo ativo encontrado para este livro." })
  }

  await prisma.$transaction([
    prisma.emprestimo.update({
      where: { id: emprestimoAtivo.id },
      data: { dataDevolucao: new Date() } 
    }),
    prisma.livro.update({
      where: { id: livroId },
      data: { disponivel: true }
    })
  ])

  return reply.status(204).send()
})

app.listen({ port: 3333 }).then(() => {
  console.log('Servidor HTTP rodando em http://localhost:3333')
})