import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
const saltRounds = 10;

export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await prisma.student.findFirst({
      where: { email }
    });

    if (!student) {
      return res.status(404).send("Estudante não encontrado");
    }

    const passwordMatch = await bcrypt.compare(password, student.password);

    if (!passwordMatch) {
      return res.status(401).send("Estudante não encontrado");
    }

    if(student.isAccepted === false) {
      return res.status(401).send("Estudante não aceito, tente mais tarde.");
    }

    const token = jwt.sign(
      {
        name: student.name,
        email: student.email,
        role: 'student'
      },
      SECRET,
      { expiresIn: '4h' }
    );

    res.status(200).json({ message: "Login realizado com sucesso!", token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao realizar login");
  }
};

export const createStudent = async (req, res) => {
  try {
    const { full_name, email, password, date_birthday, administrator_id, class_id } = req.body;

    if (!full_name || !email || !password || !administrator_id || !class_id ) {
      res.status(400).send("Faltam parâmetros obrigatórios!");
    }

    const alreadyStudent = await prisma.student.findFirst({
      where: { email}
    })

    if(alreadyStudent) {
      res.status(400).send("Já existe usuário com este email.")
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await prisma.student.create({
      data: {
        full_name,
        email,
        password: hashedPassword, 
        date_birthday,
        administrator_id,
        class_id
      }
    });

    res.status(201).send("Estudante criado com sucesso!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao criar estudante.");
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, date_birthday, password, isAccepted } = req.body;

    const administrator = await prisma.administrator.findUnique({
      where: { id}
    });

    if (!administrator) {
      return res.status(404).send("Administrador não encontrado");
    }

    const updatedData = {
      full_name,
      email,
      date_birthday
    };

    if (req.user.role === 'administrator' && accept !== undefined) {
      updatedData.accept = accept;
    }
    
    if (password) {
      updatedData.password = await bcrypt.hash(password, saltRounds);
    }

    await prisma.administrator.update({
      where: { id },
      data: updatedData,
    });

    res.status(200).send("Estudante atualizado com sucesso!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao atualizar estudante");
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id }
    });

    if (!student) {
      return res.status(404).send("Estudante não encontrado");
    }

    await prisma.student.delete({
      where: { id },
    });

    res.status(200).send("Estudante excluído com sucesso!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao excluir Estudante");
  }
};