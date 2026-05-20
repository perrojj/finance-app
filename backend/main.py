from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime

# --- 1. Configuração do Banco de Dados (SQLAlchemy) ---
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship

# Ajuste com o seu usuário e senha do PostgreSQL
DATABASE_URL = "postgresql://postgres:admin@localhost:5432/financas_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 2. Modelos do Banco de Dados (Como as tabelas serão criadas) ---
class UsuarioDB(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String)
    email = Column(String, unique=True, index=True)
    senha = Column(String) # Em um projeto real, essa senha seria criptografada!
    data_criacao = Column(DateTime, default=datetime.now)
    contas = relationship("ContaDB", back_populates="dono")

class ContaDB(Base):
    __tablename__ = "contas"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String)
    tipo = Column(String)
    saldo_atual = Column(Float)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    dono = relationship("UsuarioDB", back_populates="contas")

class CategoriaDB(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String)
    tipo = Column(String) # Ex: "Receita" ou "Despesa"
    
    # Relacionamento (1 Categoria tem N Movimentações)
    movimentacoes = relationship("MovimentacaoDB", back_populates="categoria")

class MovimentacaoDB(Base):
    __tablename__ = "movimentacoes"
    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String)
    valor = Column(Float)
    data = Column(DateTime, default=datetime.now)
    tipo = Column(String) # Ex: "Receita" ou "Despesa"
    
    # Chaves Estrangeiras (FK) apontando para os IDs das outras tabelas
    conta_id = Column(Integer, ForeignKey("contas.id"))
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    
    # Relacionamentos
    conta = relationship("ContaDB")
    categoria = relationship("CategoriaDB", back_populates="movimentacoes")

# Comando que cria as tabelas automaticamente no banco de dados
Base.metadata.create_all(bind=engine)

# --- 3. Dependência do Banco (Abre e fecha a conexão a cada requisição) ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Configuração do FastAPI e CORS ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 4. Schemas (Filtros de entrada e saída com Pydantic) ---
class LoginRequest(BaseModel):
    email: str
    senha: str

class UsuarioCreate(BaseModel):
    nome: str
    email: str
    senha: str

class UsuarioResponse(BaseModel):
    id: int
    nome: str
    email: str
    class Config:
        from_attributes = True # Permite converter do modelo do banco para JSON

class ContaBase(BaseModel):
    nome: str
    tipo: str
    saldo_atual: float
    usuario_id: int

class ContaUpdate(BaseModel):
    nome: str
    tipo: str
    saldo_atual: float    

class ContaResponse(ContaBase):
    id: int
    class Config:
        from_attributes = True

class CategoriaCreate(BaseModel):
    nome: str
    tipo: str

class MovimentacaoCreate(BaseModel):
    descricao: str
    valor: float
    tipo: str # "entrada" ou "saida"
    conta_id: int
    categoria_id: int

# --- 5. Endpoints (Rotas da API) ---

# CRIAR USUÁRIO (Cadastro)
@app.post("/api/usuarios", response_model=UsuarioResponse)
def criar_usuario(user: UsuarioCreate, db: Session = Depends(get_db)):
    # Verifica se o email já existe no banco
    usuario_existente = db.query(UsuarioDB).filter(UsuarioDB.email == user.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Salva o novo usuário
    novo_usuario = UsuarioDB(nome=user.nome, email=user.email, senha=user.senha)
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario

# LOGIN
@app.post("/api/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    # Busca o usuário no banco pelo email e senha
    usuario = db.query(UsuarioDB).filter(UsuarioDB.email == req.email, UsuarioDB.senha == req.senha).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    return {"mensagem": "Login bem-sucedido", "usuario_id": usuario.id, "nome": usuario.nome}

# CRUD DE CONTAS NO POSTGRESQL
@app.post("/api/contas", response_model=ContaResponse)
def criar_conta(conta: ContaBase, db: Session = Depends(get_db)):
    nova_conta = ContaDB(**conta.dict())
    db.add(nova_conta)
    db.commit()
    db.refresh(nova_conta)
    return nova_conta

@app.get("/api/contas/{usuario_id}", response_model=List[ContaResponse])
def listar_contas(usuario_id: int, db: Session = Depends(get_db)):
    contas = db.query(ContaDB).filter(ContaDB.usuario_id == usuario_id).all()
    return contas

@app.delete("/api/contas/{conta_id}")
def deletar_conta(conta_id: int, db: Session = Depends(get_db)):
    conta = db.query(ContaDB).filter(ContaDB.id == conta_id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    
    db.query(MovimentacaoDB).filter(MovimentacaoDB.conta_id == conta_id).delete()
    
    db.delete(conta)
    db.commit()
    return {"mensagem": "Conta deletada com sucesso"}

@app.put("/api/contas/{conta_id}")
def editar_conta(conta_id: int, conta_atualizada: ContaUpdate, db: Session = Depends(get_db)):
    # 1. Procura a conta no banco
    conta = db.query(ContaDB).filter(ContaDB.id == conta_id).first()
    
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
        
    # 2. Atualiza os valores com o que veio do formulário
    conta.nome = conta_atualizada.nome
    conta.tipo = conta_atualizada.tipo
    conta.saldo_atual = conta_atualizada.saldo_atual
    
    # 3. Salva as alterações
    db.commit()
    db.refresh(conta)
    
    return conta

@app.get("/api/categorias")
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(CategoriaDB).all()

@app.post("/api/categorias")
def criar_categoria(cat: CategoriaCreate, db: Session = Depends(get_db)):
    nova_cat = CategoriaDB(nome=cat.nome, tipo=cat.tipo)
    db.add(nova_cat)
    db.commit()
    db.refresh(nova_cat)
    return nova_cat

# --- ROTAS DE MOVIMENTAÇÕES ---
@app.post("/api/movimentacoes")
def criar_movimentacao(mov: MovimentacaoCreate, db: Session = Depends(get_db)):
    nova_mov = MovimentacaoDB(
        descricao=mov.descricao,
        valor=mov.valor,
        tipo=mov.tipo,
        conta_id=mov.conta_id,
        categoria_id=mov.categoria_id
    )
    db.add(nova_mov)
    
    # MÁGICA: Atualiza o saldo da conta automaticamente
    conta = db.query(ContaDB).filter(ContaDB.id == mov.conta_id).first()
    if conta:
        if mov.tipo == 'entrada':
            conta.saldo_atual += mov.valor
        else:
            conta.saldo_atual -= mov.valor
            
    db.commit()
    db.refresh(nova_mov)
    return nova_mov

@app.get("/api/movimentacoes/usuario/{usuario_id}")
def listar_movimentacoes_usuario(usuario_id: int, db: Session = Depends(get_db)):
    # Faz um JOIN para pegar só as movimentações das contas deste usuário
    movimentacoes = db.query(MovimentacaoDB)\
        .join(ContaDB, MovimentacaoDB.conta_id == ContaDB.id)\
        .filter(ContaDB.usuario_id == usuario_id)\
        .order_by(MovimentacaoDB.data.desc())\
        .all()
    
    return movimentacoes