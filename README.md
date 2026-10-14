# Fogo na Brasa

Site demonstrativo de delivery para o Fogo na Brasa, em Canoas/RS, desenvolvido com Next.js, React e TypeScript.

## Rodar localmente
```bash
npm install
npm run dev
```
Abra http://localhost:3000.

## O que já existe
- Página responsiva com visual escuro e detalhes em laranja/fogo.
- Catálogo com busca e categorias.
- Sacola com controle de quantidades.
- Checkout demonstrativo para entrega ou retirada.
- Formas de pagamento informativas: Pix manual, dinheiro ou cartão na entrega.
- Painel de demonstração em `/admin` para produtos e status de pedidos.
- Dados de teste para apresentar a experiência.

## Importante antes de publicar para clientes
Esta versão é somente frontend. O catálogo, os pedidos e os status ficam no localStorage do navegador. O painel não possui autenticação, os pedidos não chegam ao restaurante e os dados não sincronizam entre aparelhos. Não use para receber pedidos reais ainda.

Para operar de verdade, conectar banco de dados e backend seguro, autenticação no painel, validação dos pedidos/preços no servidor, configuração real de bairros e taxas de entrega, horário de funcionamento e canal de notificação. A taxa de R$ 6,99 é apenas ilustrativa. Não há integração de Pix online.

## Personalizar
Edite os produtos em `app/data.ts`. Cores e layout ficam em `app/globals.css`. A integração de pedidos reais deve ser implementada antes de divulgar o site como operacional.
