export type Product = { id:string; name:string; description:string; price:number; category:string; emoji:string; tag?:string; };
export const categories = ["Todos","Hambúrgueres","Combos","Churrasco","Lanches","Porções","Pizzas","Bebidas"];
export const initialProducts: Product[] = [
{id:"fb-01",name:"Brasa Clássico",description:"Burger 160g, cheddar, cebola caramelizada e molho da casa.",price:29.9,category:"Hambúrgueres",emoji:"🍔",tag:"Mais pedido"},
{id:"fb-02",name:"Duplo Incendiário",description:"Dois burgers na chapa, cheddar duplo, bacon e molho picante.",price:36.9,category:"Hambúrgueres",emoji:"🔥",tag:"Picante"},
{id:"fb-03",name:"Smash da Casa",description:"Dois smash burgers, queijo prato, picles e maionese defumada.",price:31.9,category:"Hambúrgueres",emoji:"🥩"},
{id:"fb-04",name:"Combo Fogo",description:"Brasa Clássico, batata individual e refrigerante lata.",price:42.9,category:"Combos",emoji:"🍟",tag:"Combo"},
{id:"fb-05",name:"Combo Família",description:"Dois burgers clássicos, batata grande e duas bebidas.",price:79.9,category:"Combos",emoji:"🍔"},
{id:"fb-06",name:"Espetinho de Alcatra",description:"Alcatra grelhada na brasa com tempero da casa.",price:12.9,category:"Churrasco",emoji:"🍢"},
{id:"fb-07",name:"Espetinho Misto",description:"Carne e linguiça na brasa, servido no ponto.",price:10.9,category:"Churrasco",emoji:"🔥"},
{id:"fb-08",name:"Xis Fogo",description:"Pão de xis, burger, queijo, presunto, ovo, milho e salada.",price:32.9,category:"Lanches",emoji:"🥪"},
{id:"fb-09",name:"Cachorro-quente Completo",description:"Salsicha, molho, milho, batata palha e maionese.",price:18.9,category:"Lanches",emoji:"🌭"},
{id:"fb-10",name:"Batata Cheddar & Bacon",description:"Batata crocante com cheddar cremoso e bacon.",price:27.9,category:"Porções",emoji:"🍟"},
{id:"fb-11",name:"Pizza Calabresa",description:"Molho da casa, mozzarella, calabresa e cebola.",price:44.9,category:"Pizzas",emoji:"🍕"},
{id:"fb-12",name:"Refrigerante Lata",description:"350 ml. Escolha o sabor ao finalizar o pedido.",price:6.5,category:"Bebidas",emoji:"🥤"}
];
export const formatPrice = (price:number) => price.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
