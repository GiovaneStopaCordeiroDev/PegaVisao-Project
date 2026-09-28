import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const base = 'http://127.0.0.1:5173';
const cart = [{ variacaoId: 1, quantidade: 2, preco: 100, nome: 'Moletom', cor: 'Preto', tamanho: 'M' }];
const freight = { id: 'cotacao-teste', servicoId: 1, cepDestino: '17013113', carrinhoChave: '[[1,2]]', subtotal: 200,
  expiraEm: new Date(Date.now()+600000).toISOString(), opcoes: [{ servicoId: 1, valor: 10, servico: 'PAC', transportadora: 'Correios', prazoDias: 5 }] };
let posts=0, validations=0, codigoPedido, saved, coupon={ id:1, codigo:'PEGA10', descricao:'Teste', tipo:'Percentual', valor:10,
  valorMinimo:0, descontoMaximo:null, inicioEm:'2026-01-01T00:00:00Z', validadeEm:'2099-01-01T00:00:00Z', ativo:true,
  todosProdutos:true, produtoIds:[], limiteTotal:null, limitePorUsuario:null };
let created=false;
const order=()=>({id:40,status:'Pendente',formaPagamento:'Pix',cupomCodigo:'PEGA10',valorDesconto:20,subtotalProdutos:200,valorFrete:10,valorTotal:190,
  pixQrCode:'PIX-TESTE',pagamentoExpiraEm:new Date(Date.now()+600000).toISOString(),itens:[]});
const context=await browser.newContext({viewport:{width:1366,height:900}});
const page=await context.newPage(); page.setDefaultTimeout(12000);
const errors=[]; page.on('pageerror',error=>errors.push(error.message));
await page.route('https://pegavisao-project-api.onrender.com/**',async route=>{
  const req=route.request(), path=new URL(req.url()).pathname;
  let data=[];
  if(path==='/Produto') data=[{id:1,nome:'Moletom',preco:100,variacoes:[],imagemPrincipal:''},{id:2,nome:'Camiseta',preco:50,variacoes:[],imagemPrincipal:''}];
  else if(path==='/Categoria') data=[];
  else if(path.startsWith('/api/Frete')) data=freight;
  else if(path==='/api/cupons/validar') {
    validations++; const body=req.postDataJSON();
    assert.deepEqual(body.itens,[{variacaoProdutoId:1,quantidade:2}]);
    if(body.codigo==='INVALIDO') return route.fulfill({status:422,json:{mensagem:'Cupom expirado.'}});
    data={codigo:body.codigo,subtotal:200,desconto:20,totalProdutos:180};
  } else if(path==='/api/cupons' && req.method()==='GET') data=[{cupom:coupon,usos:1,pagos:0}];
  else if(path.startsWith('/api/cupons') && ['POST','PUT'].includes(req.method())) {saved=req.postDataJSON(); coupon={...saved,id:1}; data=coupon;}
  else if(path==='/Pedido' && req.method()==='POST') {posts++;codigoPedido=req.postDataJSON().cupomCodigo;created=true;data=order();}
  else if(path==='/Pedido/40') data={id:40,status:'Pendente',servidorAgora:new Date().toISOString()};
  else if(path==='/Pedido') data=created?[order()]:[];
  await route.fulfill({json:data});
});
try {
 await page.goto(base);
 await page.evaluate(({cart,freight})=>{localStorage.setItem('token','simulado');localStorage.setItem('usuario',JSON.stringify({id:1,nome:'Teste',isAdmin:true}));
   for(const [k,v] of Object.entries({carrinho:cart,freteCheckout:freight,enderecoCheckout:{cep:'17013113',rua:'Teste',numero:'1',bairro:'Centro',cidade:'Bauru',estado:'SP'},destinatarioCheckout:{cpf:'12345678909',telefone:'14999999999'}}))localStorage.setItem(k,JSON.stringify(v));
 },{cart,freight});
 await page.goto(base+'/pagamento');
 await page.getByLabel('Cupom de desconto').fill('pega10'); await page.getByRole('button',{name:'Aplicar',exact:true}).click();
 await page.getByText('Cupom aplicado aos produtos participantes.').waitFor();
 assert.match(await page.locator('.total-pagamento').innerText(),/190,00/);
 await page.reload();await page.getByText('Cupom aplicado aos produtos participantes.').waitFor();assert.ok(validations>=2);
 await page.getByRole('button',{name:'Remover cupom'}).click();assert.match(await page.locator('.total-pagamento').innerText(),/210,00/);
 await page.getByLabel('Cupom de desconto').fill('INVALIDO');await page.getByRole('button',{name:'Aplicar',exact:true}).click();
 await page.getByText('Cupom expirado.',{exact:true}).waitFor();assert.ok(await page.getByRole('button',{name:'Ir para pagamento'}).isDisabled());
 await page.getByLabel('Cupom de desconto').fill('PEGA10');await page.getByRole('button',{name:'Aplicar',exact:true}).click();await page.getByText('Cupom aplicado aos produtos participantes.').waitFor();
 await page.getByRole('button',{name:/Pix/}).click(); const before=validations;
 await page.getByRole('button',{name:'Ir para pagamento'}).click();await page.getByRole('button',{name:'Copiar código Pix'}).waitFor();
 assert.equal(posts,1);assert.equal(codigoPedido,'PEGA10');assert.ok(validations>before);assert.equal(await page.getByLabel('Cupom de desconto').count(),0);
 await page.reload();await page.getByRole('button',{name:'Copiar código Pix'}).waitFor();assert.match(await page.locator('.total-pagamento').innerText(),/190,00/);assert.equal(posts,1);
 console.log('OK: aplicação, remoção, persistência, erro, revalidação e pedido pendente');
 await page.goto(base+'/admin');await page.getByRole('button',{name:'Cupons',exact:true}).click();await page.getByRole('heading',{name:'PEGA10'}).waitFor();
 await page.getByRole('button',{name:'Criar cupom'}).click();await page.getByLabel('Código',{exact:true}).fill('MOLETOM20');
 await page.getByLabel('Desconto (%)',{exact:true}).fill('20');await page.getByRole('combobox',{name:/^Aplicar a/}).selectOption('selecionados');
 await page.getByRole('button',{name:'Salvar cupom'}).click();await page.getByText('Selecione pelo menos um produto.',{exact:true}).waitFor();
 await page.getByLabel(/Moletom ·/).check();await page.getByRole('button',{name:'Salvar cupom'}).click();await page.getByText('Cupom salvo.',{exact:true}).waitFor();
 assert.equal(saved.todosProdutos,false);assert.deepEqual(saved.produtoIds,[1]);assert.match(saved.inicioEm,/Z$/);
 await page.getByRole('button',{name:'Editar',exact:true}).click();await page.getByLabel('Tipo de desconto').selectOption('Fixo');await page.getByLabel('Desconto (R$)',{exact:true}).fill('15');
 fs.mkdirSync('artifacts/cupons-review',{recursive:true});
 for(const [name,width,height] of [['desktop',1366,900],['mobile',390,844]]) {
  await page.setViewportSize({width,height});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:`artifacts/cupons-review/admin-${name}.png`,fullPage:true});
 }
 await page.getByRole('button',{name:'Salvar cupom'}).click();await page.getByText('Cupom salvo.',{exact:true}).waitFor();assert.equal(saved.tipo,'Fixo');assert.equal(saved.valor,15);
 await page.getByRole('button',{name:'Desativar',exact:true}).click();await page.getByText('Cupom desativado.',{exact:true}).waitFor();assert.equal(saved.ativo,false);
 assert.deepEqual(errors,[]);console.log('OK: admin cria, seleciona produtos, edita e desativa; desktop/mobile sem overflow ou erros JS');
} finally {await browser.close();}
