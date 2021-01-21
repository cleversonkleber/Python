
var msg = "Cuidado com o cachorro"
let estrategia = {
    ETAPA_1:{
        compra:{
            sim:['x','y','z'],
            nao:['Produto','CoigoCliente','Produto2','Protuto3'],
            },    
      
        venda:{
            sim:['Produto','CoigoCliente','TelefoneCliente'],
            nao:['Produto2','Protuto3']
        },
        Produto:{
                sim:['Produto','CoigoCliente','TelefoneCliente'],
                nao:['Produto2','Protuto3',olamundo(msg)]
        },
        
    },
}
debugger
function olamundo(msg){
    console.log(msg)
}

// console.log(estrategia['ETAPA_1']['compra']['sim'])

function validacao(etapa,atributo,valor){
    // console.log(estrategia[etapa][atributo])
    for( var i in estrategia[etapa][atributo]){
        if(estrategia[etapa][atributo][valor] !== estrategia[etapa][atributo][i]){
            console.log('Desabilita :'+ estrategia[etapa][atributo][i])
        }else{
            console.log('Habilita :'+ estrategia[etapa][atributo][i])
        }
    }

}
console.log('--------------------')
console.log('--------------------')
validacao('ETAPA_1','compra','sim')
console.log('--------------------')
validacao('ETAPA_1','venda','nao')
console.log('--------------------')
validacao('ETAPA_1','Produto','nao')
console.log('--------------------')