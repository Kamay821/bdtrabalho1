import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const app = Fastify()
const prisma = new PrismaClient()

app.register(cors, { 
  origin: true 
})

app.post('/usuarios', async (request, reply) => {
  const criarUsuarioSchema = z.object({
    nome: z.string(),
    email: z.string().email(),
  })
  
  const { nome, email } = criarUsuarioSchema.parse(request.body)
  
  const usuario = await prisma.usuario.create({
    data: { nome, email }
  })
  
  return reply.status(201).send(usuario)
})

app.get('/usuarios', async () => {
  return await prisma.usuario.findMany()
})

app.post('/livros', async (request, reply) => {
  const criarLivroSchema = z.object({
    titulo: z.string(),
    autor: z.string(),
    isbn: z.string(),
  })

  const dados = criarLivroSchema.parse(request.body)

  const livro = await prisma.livro.create({ data: dados })
  return reply.status(201).send(livro)
})

app.get('/livros', async () => {
  return await prisma.livro.findMany()
})

app.post('/emprestimos', async (request, reply) => {
  const emprestimoSchema = z.object({
    usuarioId: z.number(),
    livroId: z.number(),
  })

  const { usuarioId, livroId } = emprestimoSchema.parse(request.body)

  const livro = await prisma.livro.findUnique({ where: { id: livroId } })
  
  if (!livro) return reply.status(404).send({ msg: "Livro não encontrado" })
  if (!livro.disponivel) return reply.status(400).send({ msg: "Livro indisponível" })

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

app.listen({ port: 3333 }).then(() => {
  console.log('Servidor rodando em http://localhost:3333')
})