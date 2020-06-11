(function(){

  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })

  /**
   * Encontra o a tabela DOM e itera para gerar o simplex na forma de Array
   */
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

  /**
   * Insere os resultados da analise na tabela
   * @param {Array} t_sens Resultado da analise de sensibilidade
   */
  function inserirValoresAnalise( t_sens ){
    let tbody = document.getElementById('anl_sens_result')
    t_sens.forEach( linha => {
      let linhatr = document.createElement('tr')
      linha.forEach( coluna => {
        let coltd = document.createElement('td')
        coltd.appendChild( document.createTextNode( coluna ) )
        linhatr.appendChild( coltd )
      })
      tbody.appendChild(linhatr)
    })
  }

  /**
   * Realiza a analise de Sensibilidade
   * @param {Array} t_inicial Quadro Inicial
   * @param {Array} t_final Quadro Final
   */
  function analiseDeSensibilidade( t_inicial, t_final ){
    let t_sens = []
    let vars_inicial = new Map( relacionarVariaveisResultado(t_inicial))
    let vars_final = new Map( relacionarVariaveisResultado(t_final))
    let linhaFO = t_final[t_final.length - 1].get('Variaveis')
    console.log(vars_inicial)
    console.log(vars_final)
    for( let [key, value] of vars_inicial ){
      let linha = []
      let final_value = vars_final.get(key)
      final_value = final_value % 1 != 0 ? Number( final_value.toFixed(2) ) : final_value  
      let init_value = value % 1 != 0 ? Number( value.toFixed(2)) : value
      let is_f = key.indexOf('f') == 0 ? true : false
      let is_x = key.indexOf('x') == 0 ? true : false
      let precosombra = linhaFO.get(key);
      precosombra = precosombra % 1 != 0 && precosombra ? Number( precosombra.toFixed(2) ) : precosombra
      linha[0] = key,
      linha[1] = init_value,
      linha[2] = final_value
      linha[3] = is_f ? ( final_value == 0 ? 'Sim' : 'Não' ) : '-'
      linha[4] = final_value == 0 ? 'Não' : 'Sim'
      linha[5] = is_f ? 'Folga' : ( is_x ? 'Decisão' : 'Função Objetivo' )
      linha[6] = is_f ? final_value : '-'
      linha[7] = is_f ? ( init_value - final_value ) : '-'
      linha[8] = is_f && precosombra ? precosombra : '-'
      linha[9] = is_x ? precosombra : '-'
      let quos = is_f ? v3_calcQuocientes( t_final, key ) : null
      let quos_neg = is_f ? v3_calcQuocientes( t_final, key ).map( q => { q[1] *= -1; return q }) : null
      let min_pos = is_f ? minPositiveAssocArray( quos_neg ) : null
      let max_neg = is_f ? minPositiveAssocArray( quos ) : null
      linha[10] = is_f ? Number( min_pos[1].toFixed(2) ) : '-'
      linha[11] = is_f ? Number( max_neg[1].toFixed(2) ): '-'
      linha[12] = is_f ? init_value + Number( min_pos[1].toFixed(2) ) : '-'
      linha[13] = is_f ? init_value - Number( max_neg[1].toFixed(2) ) : '-'
      t_sens.push( linha )
    }
    inserirValoresAnalise( t_sens )
    document.getElementById('anl_sens').classList.remove('d-none')
  }

  /**
   * Realiza a relação de todas as variaveis do modelo,
   * informando os respectivos valores em b ou zero para os que
   * não estão na base
   * @param {Array} tabela Tabela do simplex 
   * @returns {Array} Lista com as variaveis associadas ao seu valor
   */
  function relacionarVariaveisResultado( tabela ){
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
    return resp;
  }

  /**
   * Função que gera a tabela e HTML apartir da tabela do
   * Simplex na forma de Array e mapas
   * @param {Array} t tabela do simplex 
   */
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
    table.classList.add('table', 'table-bordered')
    return table
  }

  /**
   * Gera a tabela de interpretação economica dos resultados,
   * pode ser usada a cada iteração ou no resultado final
   * @param {Array} resp Array associativo das variaveis e seus resultados
   */
  function gerarInterpretacao( resp ){
    let table = document.createElement('table')
    let thead = document.createElement('thead')
    let tbody = document.createElement('tbody')
    thead.innerHTML = "<tr><th>Variavel</th><th>Valor</th></tr>";
    resp.forEach( linha => {
      let linhatr = document.createElement('tr')
      linha.forEach( coluna => {
        let coltd = document.createElement('td')
        coltd.appendChild( document.createTextNode( coluna ) )
        linhatr.appendChild( coltd )
      })
      tbody.appendChild(linhatr)
    })
    table.appendChild(thead)
    table.appendChild(tbody)
    table.classList.add('table', 'table-bordered')
    let caption = document.createElement('caption')
    caption.appendChild(document.createTextNode('Interpretação econômica dos resultados'))
    table.appendChild(caption)
    return table
  }

  /**
   * Usada para montar solução direta quando solicitado
   * @param {Array} tabela Tabela do simplex
   */
  function solucao( tabela, msg ){
    const iteracoesdiv = document.getElementById('iteracoes')
    htmltable = gerarQuadro(tabela)
    let resp = relacionarVariaveisResultado(tabela)
    let interpretacao = gerarInterpretacao( resp )
    let title = document.createElement('h3')
    title.innerText = msg
    iteracoesdiv.appendChild(title)
    iteracoesdiv.appendChild(htmltable)
    iteracoesdiv.appendChild(interpretacao)
    iteracoesdiv.appendChild(document.createElement('hr'))
  }

  /**
   * Usada para encontrar o menor valor para sair da Base
   * @param {Map} row Linha a qual se deseja verificar
   */
  function minRow(row){
    let variaveis = row.get('Variaveis')
    let menor = [...variaveis][0]
    for( let [key, value] of variaveis ){
        if( value < menor[1] )
        menor = [key, value]
    }
    return menor;
  }

  /**
   * Usada para econtrar o menor quociente positivo em um array,
   * essa função é especifica para o Array retornado pela função
   * que calcula os cocientes do simplex
   * @param {Array} row  
   */
  function minPositiveAssocArray(row){
    let menor = [ 'notFound', Infinity ]
    row.forEach( quo => { 
        if( quo[1] < menor[1] && quo[1] > -1 )
        menor = quo
    })
    return menor
  }

  /**
   * Gera o resultado das divisões de uma determinada coluna do simplex
   * relacionando cada valor ao valor correspondente na coluna de B
   * Util para:
   *  * definir quem sai da base, e
   *  * encontar os valores para o calculo de variação de restriçoes
   * @param {Array} t Tabela do simplex 
   * @param {String} col String usada como chave para referenciar a coluna  
   */
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

  function solucaoImpossivel( tabela ){
    let item = tabela.find( linha => linha.get('Variaveis').get('b') < 0 )
    return item == undefined ? false : true;
  }

  var st_table;
  var rst_table;
  /**********************************************************************************
   * Logica 3 - Simplex Main
   *********************************************************************************/
  document.getElementById('btnCalc2').addEventListener('click', Main );
  function Main(){

    // Checks passo a passo ou solução direta
    let passoapasso = document.getElementById('forma_rst_1').checked
    let direta = document.getElementById('forma_rst_2').checked
    // Contador de iterações
    var cont = 1
    // Gera tabela na forma de Array
    var tabela = v3_DOMGerarTabela();
    // Salva a tabela inicial
    st_table = _.cloneDeep(tabela)
    // Verifica se há solução
    if( !solucaoImpossivel( tabela ) ){
      // Enquanto não encontrar a sulução executa uma iteração
      while( !v3_solucaoEncontrada(tabela) ){
        // Obtem da tabela o elemento que vai entrar na base
        var entra = v3_quemEntra( tabela ); //console.log("Entra: ", entra)
        // Obtem da tabela o elemento que vai sair da base
        var sai = v3_quemSai( tabela, entra ); //console.log("Sai: ", sai)
        // Caso não encontre quem sai 
        if( sai[0] == 'notFound' ) { 
          alert("Solução não encontrada, não é possivel definir quem sai da base"); 
          break;
        };
        // Calcula a nova linha do pivô passando quem entra e sai da base
        var linha_pivo = v3_calcularLinhaPivo( tabela, sai, entra )
        // Calculas as demais linhas da tabela passando a linha do pivo e a coluna do mesmo
        v3_calcularDemaisLinhas( tabela, linha_pivo, entra )
        // Gera o quadro da Iteração
        if( passoapasso ) solucao( tabela , 'Iteração: ' + cont )
        // Conta as iterações
        cont ++;
      }
      // Salva a tabela final
      rst_table = _.cloneDeep( tabela )
      // Caso seja solução direta
      if( direta) solucao( tabela, "Solução Direta" )
      // Faz a analise de sensibilidade
      analiseDeSensibilidade( st_table, rst_table )
    } else // Caso n tenha solução
      alert('Não é possivel encontrar solução para o modelo informado')

  }

}())