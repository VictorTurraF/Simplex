(function(){
  /**
   * Parte dos controles, 
   */
  var form = document.getElementById('simplex_form')
  var simplex = document.getElementById('simplex')
  var btnNovoSimplex = document.getElementById('btnNovoSimplex')
  // Parte do Check
  document.addEventListener('DOMContentLoaded', e => {
    let tabela = document.getElementById('formaPadraoSimplex')
    
    var htmltabela = localStorage.getItem('tabela');
    if( htmltabela != null ){
      tabela.innerHTML = htmltabela
      attachInputListeners();
      // document.getElementById('btnCalc2').classList.remove('d-none')
      form.classList.add('d-none')
      simplex.classList.remove('d-none')
    }

    let check = document.getElementById('simplexSaveCheck')

    check.addEventListener('click', function(){
      if( this.checked ){
        localStorage.setItem('tabela', document.getElementById('formaPadraoSimplex').innerHTML )
      }
      else
        localStorage.removeItem('tabela')
    })

    btnNovoSimplex.addEventListener('click', e => {
      localStorage.removeItem('tabela')
      document.location.reload(true);
    })

  })

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
  

  function attachInputListeners(){
    var simplexinputs = document.querySelectorAll('#formaPadraoSimplex input')
    simplexinputs.forEach( input => {
      input.addEventListener( 'input', function() {
        // console.log('oninput')
        this.setAttribute( 'value', this.value )
        let check = document.getElementById('simplexSaveCheck')
        if( check.checked )
          localStorage.setItem('tabela', document.getElementById('formaPadraoSimplex').innerHTML )
      })
    })
  }

  /**********************************************************************************
   * Parte do clique no 'Gerar Tabela'
   *********************************************************************************/
  document.getElementById('gerarTabela').addEventListener( 'click', e => {
    e.stopPropagation()
    e.preventDefault()
    let variaveis = Number(document.getElementById('qtdVariaveis').value)
    let restricoes = Number(document.getElementById('qtdRestricoes').value)

    if( [variaveis, restricoes].find( el => el < 1 ) === undefined ){
      let tabela = []
      
      let check = document.getElementById('simplexSaveCheck')

      v3_gerarTabelaDOM( variaveis, restricoes, tabela )
      // document.getElementById('btnCalc2').classList.remove('d-none')
      
      form.classList.add('d-none')
      simplex.classList.remove('d-none')
      // Se checada guarda a tabela
      if( check.checked )
        localStorage.setItem('tabela', document.getElementById('formaPadraoSimplex').innerHTML )
      else
        localStorage.removeItem('tabela')
  
      attachInputListeners();
    }else{
      alert('Informe valores válidos para gerar o Simplex')
    }

    
  })

  

  function v3_gerarTabelaDOM( vars, rest, t ){
    var tabela = document.getElementById('formaPadraoSimplex')
    var thead = tabela.createTHead()
    var cabecalho = thead.insertRow()
    cabecalho.id = 'headerSimplex'
    var base = document.createElement('th')
    base.appendChild(document.createTextNode('Base'))
    cabecalho.appendChild(base)
    for( let v = 1; v <= vars; v++ ){
      let variavel = document.createElement('th')
      variavel.appendChild(document.createTextNode( "x"+ v.toString()))
      cabecalho.appendChild(variavel)
    }
    for( let f = 1; f <= rest; f++ ){
      let folga = document.createElement('th')
      folga.appendChild(document.createTextNode( "f"+ f.toString()))
      cabecalho.appendChild(folga)
    }
    var b = document.createElement('th')
    b.appendChild(document.createTextNode('b'))
    cabecalho.appendChild(b)
    var tbody = tabela.createTBody()
    for( let r = 1 ; r <= rest; r++ ){
      let restricao = tbody.insertRow(-1)
      inserirCampos( 'f' + r.toString(), vars, rest, restricao )
    }
    let fo = tbody.insertRow(-1)
    var foz = document.getElementById('tipoSolução').value
    var fostr = foz == -1 ? '-Z' : 'Z'
    inserirCampos( fostr, vars, rest, fo )
  }
  
  function inserirCampos( base, vars, rest, row ){
    let basecell = row.insertCell(-1)
    let inputbase = document.createElement('input')
    inputbase.value = base;
    inputbase.setAttribute('value', base)
    inputbase.disabled = true
    inputbase.classList.add('form-control')
    basecell.appendChild( inputbase )
    // console.log(vars + rest)
    for(  let v = 0; v < (vars + rest); v++){
      let variavel = row.insertCell(-1)
      let input = document.createElement('input')
      // pege o valor na tabela
      input.type = 'number'
      input.classList.add('form-control')
      variavel.appendChild(input)
    }
    let b = row.insertCell(-1)
    let inputb = document.createElement('input')
    inputb.classList.add('form-control')
    inputb.type = 'number'
    b.appendChild(inputb)
  }

}());