(function(){
  function v3_DOMGerarTabela(){
    let table = [];
    let rows = document.querySelectorAll('tbody tr');
    var keys = document.querySelectorAll('table thead tr th');
    keys = Array.prototype.map.call( keys, function( a ){
        return a.textContent;
    })
    rows.forEach( function(r){
      let linha = new Map();
      let vars = new Map();
      Array.prototype.forEach.call( r.cells, function( d, i ){ 
      let value = d.querySelector('input').value
      if( i == 0 ){
          linha.set( keys[ d.cellIndex ], value )
      }else{
          vars.set( keys[ d.cellIndex ], Number(value)  )
      }
      })
      linha.set( 'Variaveis', vars );
      table.push( linha )
    })
    return table;
  }

  function gerarQuadro( t ){
    let table = document.createElement('table')
    let thead = document.createElement('thead')
    let tbody = document.createElement('tbody')
    thead.appendChild( document.getElementById('headerSimplex').cloneNode(true) )
    t.forEach( linha => {
      let tr = document.createElement('tr')
      let tdbase = document.createElement('td')
      tdbase.appendChild(document.createTextNode(linha.get('Base')))
      tr.appendChild( tdbase )
      for( let [key, value] of linha.get('Variaveis') ){
        let td = document.createElement('td')
        valor = value % 1 != 0 ? value.toFixed(3) : value
        td.appendChild(document.createTextNode(valor))
        tr.appendChild( td )
      }
      tbody.appendChild(tr)
    })
    table.appendChild(thead);
    table.appendChild(tbody);
    table.classList.add('table')
    return table
  }

  function inserirIteracao( tabela, cont ){
    htmltable = gerarQuadro(tabela)
    const iteracoesdiv = document.getElementById('iteracoes')
    let etapa = document.createElement('h2')
    etapa.classList.add('mt-4')
    etapa.appendChild( document.createTextNode('Iteração n. ' + cont) )
    iteracoesdiv.appendChild(etapa)
    iteracoesdiv.appendChild(htmltable)

    let resp = []
    for( let [key, value] of tabela[0].get('Variaveis') ){
      if( key != 'b' ){
        let resplinha = [ key, 0 ]
        // console.log(resplinha)
        tabela.forEach( linha => {
          if( linha.get('Base') == key ){
            resplinha[1] = linha.get('Variaveis').get('b')
          }
        })
        resp.push(resplinha)
      }
    }
    linhaz = tabela[tabela.length - 1]

    var foz = document.getElementById('tipoSolução').value

    var fostr = foz == -1 ? linhaz.get("Base").replace( '-', '') : linhaz.get("Base")

    resp.push( [ fostr, linhaz.get('Variaveis').get('b') * foz ] )
    
    let p = document.createElement('h2')
    p.innerText = "Variáveis"
    iteracoesdiv.appendChild(p)
    let pvars = document.createElement('p')
    resp.forEach( (r, i) => {
      pvars.appendChild( document.createTextNode(r[0] + " = " + r[1]))
      if(i != resp.length - 1 )
        pvars.appendChild( document.createTextNode(', '))
      else
        pvars.appendChild( document.createTextNode('.'))
    })
    iteracoesdiv.appendChild(pvars)
  }

  function showTable(t){
    for( let value of t )
      console.log(value);
  }
  function minRow(row){
    let variaveis = row.get('Variaveis')
    let menor = [...variaveis][0]
    for( let [key, value] of variaveis ){
        if( value < menor[1] )
        menor = [key, value]
    }
    return menor;
  }
  function minPositiveAssocArray(row){
    let menor = [ 'notFound', Infinity ]
    row.forEach( quo => { 
        if( quo[1] < menor[1] && quo[1] > -1 )
        menor = quo
    })
    return menor
  }

  function v3_calcQuocientes(t, col){
    let quo = [];
    let table = t.slice(0, t.length - 1) // Remove a linha de z
    table.forEach( linha => {
      let vals = linha.get('Variaveis')
      let entracol = vals.get(col)
      let bcol = vals.get('b')
      quo.push( [ linha.get('Base'), bcol / entracol, entracol] )
    })
    // Ordena os quocientes (primeiros as folgas depois variaveis de decisão)
    // Ele ja faz isso para dar prioridade as variaveis de folga
    return quo.sort( (a, b) => a[0].indexOf('x') == 0 && b[0].indexOf('f') == 0  );
  }

  /**
   * Informa se foi encontrada solução analisando a FO na tabela
   * Retorna verdadeiro ou falso
   * @param {Array} t tabela do simplex
   */
  function v3_solucaoEncontrada( t ){
    // Pega a linha da FO
    var linhaFO = t[t.length - 1];
    // Percorre a linha
    for( let [key, value] of linhaFO.get('Variaveis'))
      if( value < 0 )
        return false
    // Caso não encontre negativos retona true
    return true
  }

  /**
   * Retorna a coluna que entra na Base
   * @param {Array} t tabela do simplex
   */
  function v3_quemEntra( t ){
    // Pega a linha da FO
    var linhaFO = t[t.length - 1];
    // Retorna o menor valor da linhaFo
    return minRow( linhaFO );
  }

  /**
   * Retorna o elemento pivo com a linha q vai sair da Base
   * @param {Array} entra Quem entra na base
   * @param {Array} t Tabela do simplex
   */
  function v3_quemSai( t, entra ){
    // Obtem o indice da coluna
    var col = entra[0]
    // Calcula os quocientes
    var quocientes = v3_calcQuocientes( t, col )
    // Retorna o menor positivo
    console.log(quocientes)
    return minPositiveAssocArray( quocientes )
  }

  /**
   * Função responsável por calcular a linha do Pivo
   * Onde o elemento pivo deve resultar em 1
   * @param {Array} t Tabela do simplex
   * @param {Array} sai Dados do elemento que vai sair da base 
   * @param {Array} entra Dados do elemento que vai entrar na base
   */
  function v3_calcularLinhaPivo( t, sai, entra ){
    // Busca a linha referente ao pivo (sai)
    var linha = t[t.findIndex( linha => linha.get('Base') == sai[0] )]
    // Insere o nome da variavel que vai entrar na base
    linha.set('Base', entra[0] )
    // Obtem o conjunto de variaveis
    let vars = linha.get('Variaveis')
    // Percorre fazendo o calculo nessa linha
    for( let [key, value] of vars )
        vars.set( key, value / sai[2] )
    // Retorna nova linha do pivo que será usada para calcular as demais linhas
    return linha
  }

  /**
   * Faz os calculos nas demais linha, de forma que,
   * na coluna do pivo os elementos sejam 0 (Exeto o pivo que ja é 1)
   * @param {Array} t Tabela do simplex
   * @param {Array} linha_pivo linha do Pivo retornada quando calcularLinhaPivo é executada
   * @param {Array} entra Dados do elemento que vai entrar na base
   */
  function v3_calcularDemaisLinhas(t, linha_pivo, entra ){
    // Variaveis da linha do pivo
    let pivo = linha_pivo.get('Variaveis')
    // Percorre as linha da tabela
    t.forEach( linha => {
      // Verifica se não é a linha do pivo
      if( linha.get('Base') != linha_pivo.get('Base') ){
        // Variavei da linha atual
        let vars = linha.get('Variaveis') 
        // Valor que eu quero zerar invertido
        let zerar = vars.get(entra[0]) * -1; 
        // Percorre as variaveis de cada linha
        for( let [key, value] of vars ){
          // (Valor respecitivo na linha do pivo) * (Valor a zerar) + (valor atual da linha)
          vars.set( key, pivo.get(key) * zerar + value )
        }
      }
    })
  }


  /**********************************************************************************
   * Logica 3 - Simplex Main
   *********************************************************************************/
  document.getElementById('btnCalc2').addEventListener('click', Main );
  function Main(){
    var cont = 1
    // Gera tabela na forma de Array
    var tabela = v3_DOMGerarTabela();
    console.log(tabela)
    // Enquanto não encontrar a sulução executa uma iteração
    while( !v3_solucaoEncontrada(tabela) ){
      // Obtem da tabela o elemento que vai entrar na base
      var entra = v3_quemEntra( tabela ); console.log("Entra: ", entra)
      // Obtem da tabela o elemento que vai sair da base
      var sai = v3_quemSai( tabela, entra ); console.log("Sai: ", sai)
      // Caso não encontre quem sai 
      if( sai[0] == 'notFound' ) { console.log("Solução não encontrada"); break};
      // Calcula a nova linha do pivô passando quem entra e sai da base
      var linha_pivo = v3_calcularLinhaPivo( tabela, sai, entra )
      // Calculas as demais linhas da tabela passando a linha do pivo e a coluna do mesmo
      v3_calcularDemaisLinhas( tabela, linha_pivo, entra )
      // Gera o quadro da Iteração
      inserirIteracao( tabela , cont )
      // Conta as iterações
      // if( cont == 1 ) break;
      cont ++;
    }
    console.log(tabela)
  }

}())