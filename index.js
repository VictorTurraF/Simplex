(function(){
    
  // Funcao para retornar o menor valor de um array
  Array.min_assoc = function(array) {
    var menor = array[0].value;
    var obj = array[0];
    array.forEach( function(c){
      if( c.value < menor ){
        menor = c.value;
        obj = c;
      }
    })
    return obj;
  };
  function menorPositivo( array ){
    var menor = Infinity;
    var obj = false;
    array.forEach( function(l){
      if(l[1] != null){
        if( l[1] < menor ){
          menor = l[1];
          obj = l;
        }
      }
    })
    return obj;
  }
  function solucaoEncontrada( t ){
    var linha = t[t.length - 1];
    for( var i in linha ){
      if( i != 'Linha' && i != 'Base' ){
        if( linha[i] < 0 )
          return false;
      }
    }
    return true;
  }
  function quemEntra( t ){
    var linha = t[t.length - 1];
    var nums = []
    for( var i in linha ){
      if( i != 'Linha' && i != 'Base' ){
        nums.push( { key: i, value: linha[i] } );
      }
    }
    return Array.min_assoc( nums );
  }
  function quemSai( t, e ){
    var nums = []
    t.forEach( function(l){
      if(l.Base != 'Z'){
        let quo = l.b / l[e.key];
//          console.log(l.b);
//          console.log(l[e.key]);
        if( quo < 0 )
          quo = null;
        nums.push( [ l.Base , quo, l[e.key] ] );
      }
    })
//      console.log(nums);
    return menorPositivo( nums );
  }
  function substituirLinhaPivo( t, entra, sai ){
    for( let x = 0; x < t.length; x++ ){
      if( t[x].Base == sai[0] ){ // Linha do pivo
        t[x].Base = entra.key;
        for( var i in t[x] ){
          if( i != 'Linha' && i != 'Base' ){
            t[x][i] = t[x][i] / sai[2];
          }
        }
        return t[x] // Retorna a linha que entrou na base
      }
    }
  }
  function calcularDemaisLinhas( t, entra, linha_pivo ){
//      console.log(t, entra, linha_pivo);
    for( let x = 0; x < t.length; x++ ){
      if( t[x].Base != entra.key ){
//          console.log(t[x].Base);
        let val = t[x][entra.key] * -1;
        for( var i in t[x] ){
          if( i != 'Linha' && i != 'Base' ){
//              console.log("Base: " + t[x].Base);
//              console.log(linha_pivo[i]);
//              console.log(val);
//              console.log(t[x][i]);
            t[x][i] = linha_pivo[i] * val + t[x][i];
          }
        }
      }
    }
  }
  function FolgaHeader( last ){
    let num = parseInt( last.dataset.folga ) + 1;
    var th = last.cloneNode(true);
    last.classList.remove('lst');
    th.dataset.folga = num;
    th.textContent = 'f' + num
    return th;
  }
  
  function VarHeaderCell( last ){ 
    let num = parseInt( last.dataset.var ) + 1;
    var th = last.cloneNode(true);
    last.classList.remove('lst-var');
    th.dataset.var = num;
    th.textContent = 'x' + num
    return th;
  }
  function VarCell( last ){ 
    let num = parseInt( last.dataset.var ) + 1;
    var td = last.cloneNode(true);
    last.classList.remove('lst-var');
    td.dataset.var = num;
    return td;
  }
  
  function FolgaCell( last ){
    let num = parseInt( last.dataset.folga ) + 1;
    var td = last.cloneNode(true);
    last.classList.remove('lst');
    td.dataset.folga = num;
//      if( parseInt( last.parentNode.dataset.row ) == num )
//      {
//        td.textContent = 1;
//      }else{
//        td.textContent = 0;
//      }
    return td;
  }
  
  function Linha( last ){
    let num = parseInt( last.dataset.row ) + 1;
    var r = last.cloneNode(true)
    last.classList.remove('last-row')
    r.dataset.row = num
    r.cells[0].textContent = num
    r.cells[1].dataset.row = num
    r.cells[1].textContent = 'f' + num
    
//      Array.prototype.forEach.call( r.cells, function(c){
//        if( typeof( c.dataset.folga ) !== 'undefined' )
//        {
//          c.textContent = '0';
//        }
//      })
    
    return r;
  }

  function gerarTabelaResultado( ctx, table ){
    let thead = document.createElement('thead')
    let tbody = document.createElement('tbody')
    thead.appendChild( document.getElementById('headerSimplex').cloneNode(true) )
    table.forEach(function(linha){
      let tr = document.createElement('tr');
      for( var i in linha ){
        let td = document.createElement('td')
        if(['Linha', 'Base'].includes(i)){
          td.innerText = linha[i]
        }else{
          td.innerText = linha[i] % 1 != 0 ? linha[i].toFixed(3) : linha[i]
        }
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    })
    ctx.appendChild(thead)
    ctx.appendChild(tbody)
    ctx.classList.remove('d-none');
    document.getElementById('r33').classList.remove('d-none')
    let resp = []
    Array.prototype.forEach.call( thead.rows.headerSimplex.cells, cel => {
      if(![0, 1].includes(cel.cellIndex)){
        resp.push([ cel.textContent, 0]);
      }
    })
    table.forEach( linha => {
      resp.forEach( resplinha => {
        if(resplinha[0] == linha.Base){
          resplinha[1] = linha.b
        }
      })
      if( linha.Base == 'Z' ){
        resp.push( [ linha.Base, linha.b ] )
      }
    })
    // console.log(resp);
    let p = document.createElement('h2')
    p.innerText = "Variáveis"
    ctx.parentNode.appendChild(p)
    resp.forEach( r => {
      let p = document.createElement('p')
      p.innerText = r[0] + " = " + r[1]
      ctx.parentNode.appendChild(p)
    })
  }

  var btnAddRow = document.getElementById('btnAddRow');
  var btnAddVar = document.getElementById('btnAddVar');
  var btnCalc = document.getElementById('btnCalc');
  
  btnAddRow.addEventListener( 'click', function(e){
    
    var tbody = document.querySelector('table tbody');
    
    // Adiciona um linha
    var lst_row = document.querySelector('.last-row')
    var row = new Linha( lst_row );
    tbody.insertBefore( row, lst_row.nextSibling )
    
    // Adiciona coluna de folga
    
    // Adiciona ao header
    var header = document.querySelector('tr th.lst')
    var nextheader = new FolgaHeader( header )
    header.parentNode.insertBefore( nextheader, header.nextSibling )
    
    // Adiciona as celulas
    var cels = document.querySelectorAll('tr:not(.z) td.lst')
    if( cels != null ){
      cels.forEach( function(c){
        
        var nextcel = new FolgaCell( c );
        c.parentNode.insertBefore( nextcel, c.nextSibling )
        
      })
    }
    
    
    var z = document.querySelector('tr.z td.lst')
    var nextz = new FolgaCell( z );
    z.parentNode.insertBefore( nextz, z.nextSibling )
    
//      console.log(header, cels, z)
//      console.log(fields);

  });
  
  btnAddVar.addEventListener('click', function(){
    let header = document.querySelector('tr th.lst-var')
    let nextheader = new VarHeaderCell( header )
    header.parentNode.insertBefore( nextheader, header.nextSibling )
    
    let cells = document.querySelectorAll('tr td.lst-var')
    cells.forEach( function(c){
      var nextcell = new VarCell( c );
      c.parentNode.insertBefore( nextcell, c.nextSibling )
    })
    console.log(cells);
//      let cells = document.querySelectorAll('')
  })
  

  /**********************************************************************************
   * Logica 1
   *********************************************************************************/
  btnCalc.addEventListener( 'click', function(e){
    var table = [];
    let rows = document.querySelectorAll('tbody tr');
    // Verifica as chaves
    var keys = document.querySelectorAll('table thead tr th');
    keys = Array.prototype.map.call( keys, function( a ){
      return a.textContent;
    })
    // Monta a tabela
    rows.forEach( function(r){
      let linha = {};
      Array.prototype.forEach.call( r.cells, function( d, i ){ 
        if( i == 0 || i == 1 ){
          linha[keys[ d.cellIndex ]] = d.textContent;
        }else{
          linha[keys[ d.cellIndex ]] = parseFloat( d.querySelector('input').value );
        }
      })
      table.push( linha )
    })
    // Tabela pronta
    var cont = 1;
    // console.log("Tabela Inicial: ", table);
    while( !solucaoEncontrada( table ) ){
      var entra = quemEntra( table )
      var sai = quemSai( table, entra )
      if(sai == false){
        console.log("Não há solução (Coeficientes negativos)")
        break;
      }
      // Com as info do entra e sai é possivel localizar o pivo
      // O valor do pivo tbm é indicado pelo sai[2]
      var linha_ref = substituirLinhaPivo( table, entra, sai );
      calcularDemaisLinhas( table, entra, linha_ref  );
      // console.log("S(" + cont + "): ", table);
      cont ++;
    }

    gerarTabelaResultado( document.getElementById('result'), table );

  });

  /**********************************************************************************
   * Logica 2 - Scripts com DOM (Não Importante para entender a lógica)
   *********************************************************************************/
  document.getElementById('btnCalc2').addEventListener('click', Main );

  function DOMGerarTabela(){
    let table = [];
    let rows = document.querySelectorAll('tbody tr');
    var keys = document.querySelectorAll('table thead tr th');
    keys = Array.prototype.map.call( keys, function( a ){
      return a.textContent;
    })
    rows.forEach( function(r){
      let linha = [];
      Array.prototype.forEach.call( r.cells, function( d, i ){ 
        let value = d.querySelector('input').value
        if( i == 0 ){
          linha.push( [keys[ d.cellIndex ], value] )
        }else{
          linha.push( [keys[ d.cellIndex ], Number(value) ] )
        }
      })
      table.push( linha )
    })
    return table;
  }
  function forEachAssoc( array, callback ){
    array.forEach( el => {
      callback( el[0], el[1] )
    })
  }
  function getArrayValues( array ){
    values = [];
    array.forEach( el => {
      values.push( el[1] )
    })
    return values;
  }
  function getArrayKeys( array ){
    values = [];
    array.forEach( el => {
      values.push( el[0] )
    })
    return values;
  }
  function minAssoc( array ){
    menor = array[1];
    array.forEach( e => {
      if(e[0] != 'Base')
        if(e[1] < menor[1])
          menor = e
    })
    return menor;
  }
  function searchWithinRowByKey( row, key ){
    let keys = getArrayKeys( row );
    let found = keys.findIndex( el => el == key )
    return row[found]
  }
  function calcQuocientes(t, col){
    let quo = [];
    t.forEach( linha => {
      if( linha[0][1] != 'Z' ){
        let entracol = searchWithinRowByKey( linha, col )
        let bcol = searchWithinRowByKey( linha, 'b' )
        quo.push( [ linha[0][1], bcol[1] / entracol[1] ] )
      }
    })
    return quo;
  }
  function orderQuotients( quos ){
    return quos.sort( (a, b) => a[0].indexOf('x') == 0 && b[0].indexOf('f') == 0  )
  }

  /**********************************************************************************
   * Logica 2 - Lógica do Simplex
   *********************************************************************************/
  /**
   * Informa se foi encontrada solução analisando a FO na tabela
   * Retorna verdadeiro ou falso
   * @param {Array} t tabela do simplex
   */
  function v2_solucaoEncontrada( t ){
    // Pega a linha da FO
    var linhaFO = t[t.length - 1];
    // Obtem um array so com valores
    var values = getArrayValues(linhaFO);
    // Informa o primeiro negativo
    const found = values.find( celula => celula < 0 )
    // Se não encontrou nenhum negativo retorna true, senão falso
    return found === undefined ? true : false;
  }

  /**
   * Retorna a coluna que entra na Base
   * @param {Array} t tabela do simplex
   */
  function v2_quemEntra( t ){
    // Pega a linha da FO
    var linhaFO = t[t.length - 1];
    // Retorna o menor valor da linhaFo
    return minAssoc( linhaFO );
  }

  /**
   * Retorna o elemento pivo com a linha q vai sair da Base
   * @param {Array} entra Quem entra na base
   * @param {Array} t Tabela do simplex
   */
  function v2_quemSai( entra, t ){
    // Obtem o indice da coluna
    var col = entra[0];
    // Calcula os quocientes
    var quocientes = calcQuocientes( t, col );
    // Ordena os quocientes (primeiros as folgas depois variaveis de decisão)
    var quocientes = orderQuotients( quocientes )
    // Busca o menor positivo
    console.log(quocientes)
  }

  /**********************************************************************************
   * Logica 2 - Simplex Main
   *********************************************************************************/
  function Main(){

    // Gera tabela na forma de Array
    var tabela = DOMGerarTabela();
    console.log(tabela)

    // Obtem da tabela o elemento que vai entrar na base
    var entra = v2_quemEntra( tabela );
    console.log(entra)
    // Obtem da tabela o elemento que vai sair da base
    var pivo = v2_quemSai( entra, tabela );

  }

}());