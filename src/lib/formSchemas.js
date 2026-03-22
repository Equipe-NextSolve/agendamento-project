import { z } from "zod";

const today = () => new Date().toISOString().split("T")[0];

export const cadastroSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "Informe um nome com pelo menos 3 caracteres."),
  email: z.string().trim().email("Informe um e-mail valido."),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  perfil: z.enum(["cliente", "prestador"], {
    message: "Selecione um perfil valido.",
  }),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail valido."),
  senha: z.string().min(1, "Informe sua senha."),
});

const availabilityEntrySchema = z
  .object({
    day: z.string().min(1, "Dia invalido."),
    enabled: z.boolean(),
    start: z.string().min(1, "Informe o horario inicial."),
    end: z.string().min(1, "Informe o horario final."),
  })
  .refine((value) => !value.enabled || value.start < value.end, {
    message: "O horario final deve ser maior que o inicial.",
    path: ["end"],
  });

export const providerServiceSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(3, "Informe o nome do servico com pelo menos 3 caracteres."),
    duracao: z.coerce
      .number({
        invalid_type_error: "Informe a duracao em minutos.",
      })
      .int("Informe a duracao em minutos inteiros.")
      .min(1, "Informe ao menos 1 minuto.")
      .max(1440, "A duracao maxima permitida e de 1440 minutos."),
    descricao: z
      .string()
      .trim()
      .min(10, "A descricao deve ter pelo menos 10 caracteres."),
    disponibilidade: z.array(availabilityEntrySchema),
  })
  .refine((value) => value.disponibilidade.some((item) => item.enabled), {
    message: "Selecione pelo menos um dia disponivel.",
    path: ["disponibilidade"],
  });

export const agendamentoSchema = z.object({
  serviceId: z.string().trim().min(1, "Selecione um servico."),
  date: z
    .string()
    .min(1, "Selecione uma data.")
    .refine((value) => value >= today(), {
      message: "Escolha uma data igual ou posterior a hoje.",
    }),
  time: z.string().min(1, "Selecione um horario."),
  pet: z
    .string()
    .trim()
    .min(2, "Informe o nome do pet com pelo menos 2 caracteres."),
  notes: z
    .string()
    .trim()
    .max(300, "As observacoes devem ter no maximo 300 caracteres.")
    .optional()
    .or(z.literal("")),
});
