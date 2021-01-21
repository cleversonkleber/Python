/************************************************************/
/* Nome do Fluxo: Cadastrar cliente unificado               */
/* Data da Atualização: 08/10/2019 - Clayton                */
/************************************************************/

var VC = VC || {};
(VC.GSC = {
    Configuracao: {
        CamposDeTelefone: [],
        CamposDeEMail: [],
        CamposDeCNPJ: [],
        CamposDeCPF: [],
	CamposDeNotaFiscal: [],
        UsuarioCorrente: "",
        siteUrl: "",
        TitulosDasAbas: [],
        CamposLimitadores: [],
        CamposDeDinheiro: [],
        OcultarLinhas: []
    },

    obterChaves: function (objeto) {
        var chaves = [];
        for (k in objeto) chaves.push(k);
        return chaves;
    },

    init: function () {
        var subObjetos = VC.GSC.obterChaves(VC.GSC);
        $.each(subObjetos, function (i, v) {
            if (VC.GSC[v].hasOwnProperty("init")) {
                VC.GSC[v].init();
            }
        });
		
        VC.GSC.Configuracao.siteUrl = _spPageContextInfo.webAbsoluteUrl;
        VC.GSC.configurarMascaraTelefone();
        VC.GSC.configurarMascaraDinheiro();
        VC.GSC.configurarMascaraCNPJ();
        VC.GSC.configurarMascaraCPF();
        VC.GSC.obterUsuarioCorrente();
        VC.GSC.configurarMascaraDinheiro();
        VC.GSC.validarEmailParaOUsuario();
        VC.GSC.configurarMascaraFone('VC');
        VC.GSC.ocultar();
    },
                formatarDocumento: function(valor){
                               var valorFormatado = valor;
                               if(valorFormatado.length == 11){
                                               valorFormatado = valorFormatado.replace( /\D/g , ""); //Remove tudo o que não é dígito
                                               valorFormatado = valorFormatado.replace( /(\d{3})(\d)/ , "$1.$2"); //Coloca um ponto entre o terceiro e o quarto dígitos
                                               valorFormatado = valorFormatado.replace( /(\d{3})(\d)/ , "$1.$2"); //Coloca um ponto entre o terceiro e o quarto dígitos
                                               //de novo (para o segundo bloco de números)
                                               valorFormatado = valorFormatado.replace( /(\d{3})(\d{1,2})$/ , "$1-$2"); //Coloca um hífen entre o terceiro e o quarto dígitos
                               }
                               else if(valorFormatado.length == 14) {
                                               valorFormatado = valorFormatado.replace( /\D/g , ""); //Remove tudo o que não é dígito
                                               valorFormatado = valorFormatado.replace( /^(\d{2})(\d)/ , "$1.$2"); //Coloca ponto entre o segundo e o terceiro dígitos
                                               valorFormatado = valorFormatado.replace( /^(\d{2})\.(\d{3})(\d)/ , "$1.$2.$3"); //Coloca ponto entre o quinto e o sexto dígitos
                                               valorFormatado = valorFormatado.replace( /\.(\d{3})(\d)/ , ".$1/$2"); //Coloca uma barra entre o oitavo e o nono dígitos
                                               valorFormatado = valorFormatado.replace( /(\d{4})(\d)/ , "$1-$2"); //Coloca um hífen depois do bloco de quatro dígitos
                               }
                               
                               return valorFormatado;
                },

	
    validarEmail: function (valorCampoEmail) {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(valorCampoEmail)
    },

    validarEmail: function (valorCampoEmail) {
		var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		return regex.test(valorCampoEmail)
	},
	
	validarEmailParaOUsuario: function() {
		if (typeof CAPContext != "undefined") {
			$.each(VC.GSC.Configuracao.CamposDeEmail, function (i, nomeDoAtributo){
				if(VC.GSC.existeCampo(nomeDoAtributo)){
					var objetoEmail = VC.GSC.obterObjetoDoCap(nomeDoAtributo);
					var campoEmailPossuiValorInvalido = false;
					if(objetoEmail.control.is('input') || objetoEmail.control.is('textarea')){
						if(objetoEmail.control.is('textarea')){
							objetoEmail.control.closest('td').append(
								"<label style='color: Blue; font-weight: bold;'>Favor inserir cada um dos valores de e-mail procedidos imediatamente de \";\".</label>"
							);
						}
						var valoresInvalidos = [];
						objetoEmail.control.focusout(function(){
							campoEmailPossuiValorInvalido = false;
							if(objetoEmail.control.is('textarea')){
								var valoresDeEmail = objetoEmail.control.val().split(';');
								$.each(valoresDeEmail, function(i, valorInvestigado){
									valorInvestigado = valorInvestigado.trim();
									if(!VC.GSC.validarEmail(valorInvestigado) && valorInvestigado != ""){
										valoresInvalidos.push(valorInvestigado);
										campoEmailPossuiValorInvalido = true;
									}
								});
							}
							else if(objetoEmail.control.is('input')){
								if(!VC.GSC.validarEmail(objetoEmail.control.val()) && objetoEmail.control.val() != ""){
									alert('O campo ' + objetoEmail.name + ' não possuí um valor válido de e-mail.');
									campoEmailPossuiValorInvalido = true;
								}
							}
							
							if(objetoEmail.control.is('textarea') && valoresInvalidos.length != 0){
								var textoDeValoresInvalidos = "";
								$.each(valoresInvalidos, function(i, valor){
									textoDeValoresInvalidos += valor + ";";
								});
								alert('Erro de Preenchimento! Os seguintes valores são e-mails inválidos:\n' +
									textoDeValoresInvalidos
								);
								valoresInvalidos = [];
							}
						});
						
						if($('[id$=sendRequest]').length > 0){
							$('[id$=sendRequest]').click(function(e){
								var objetoEmail = VC.GSC.obterObjetoDoCap(nomeDoAtributo);
								if(objetoEmail.displayMode == "Required" && campoEmailPossuiValorInvalido){
									e.preventDefault();
									objetoEmail.control.closest('tr').find('span[title=Requerido]').show();
									objetoEmail.control.closest('td').find("div span[id$='RequiredFieldValidator']").show();
								}
							});
						}
					}
				}
			});
		}
		return false;
	},
	
	configurarMascaraNotaFiscal: function (tipoDeArea) {
        $.each(VC.GSC.Configuracao.CamposDeNotaFiscal, function (i, nomeDoAtributo) {
            if (VC.GSC.existeCampo(nomeDoAtributo)) {
                var maskVC = "000000000";
                var maskEGX = "000000";
                var obj = VC.GSC.obterObjetoDoCap(nomeDoAtributo);
                if (obj.control.is('input') &&
				obj.control.val() == "" &&
				(obj.control.val() == maskVC ||
				obj.control.val() == maskEGX)) {
                    obj.control.val('');
                }
                if (tipoDeArea == "VC") {
                    if (obj.control.is('input')) {
                        obj.control.unbind();
                        obj.control.mask(maskVC);
                    }
                    obj.control.focusout(function () {
                        var tamanhoNotaFiscal = obj.control.val().length;
                        if (obj.control.val().length < 9) {
                            for (var i = 0; i < 9 - tamanhoNotaFiscal; i++) {
                                obj.control.val("0" + obj.control.val());
                            }
                        }
                    });
                }

                else if (tipoDeArea == "EGX") {
                    if (obj.control.is('input')) {
                        obj.control.unbind();
                        obj.control.mask(maskEGX);
                    }
                    obj.control.focusout(function () {
                        var tamanhoNotaFiscal = obj.control.val().length;
                        if (obj.control.val().length < 6) {
                            for (var i = 0; i < 6 - tamanhoNotaFiscal; i++) {
                                obj.control.val("0" + obj.control.val());
                            }
                        }
                    });
                }

                else {
                    if (obj.control.is('input')) {
                        obj.control.unbind();
                        obj.control.unmask();
                    }
                }
            }
        });
     },

    configurarMascaraTelefone: function () {
        if (typeof CAPContext != "undefined") {
            $.each(VC.GSC.Configuracao.CamposDeTelefone, function (i, nomeDoAtributo) {
                if (VC.GSC.existeCampo(nomeDoAtributo)) {
                    var obj = VC.GSC.obterControleDoCap(nomeDoAtributo);
                    if (obj.is('input')) {
                        obj.focusout(function (e) {
                            var objeto, telefone, elemento;
                            objeto = (e.currentTarget) ? e.currentTarget : e.srcElement;
                            telefone = objeto.value.replace(/\D/g, '');
                            elemento = $(objeto);
                            elemento.unmask();
                            if (telefone.length > 10) {
                                elemento.mask("(99) 99999-9999");
                            } else {
                                elemento.mask("(99) 99999-9999");
                            }
                        }).mask("(99) 99999-9999");
                    }
                }
                else {
                    console.log("O campo " + nomeDoAtributo + " não existe");
                }
            });
        }
        return false;
    },

	configurarMascaraFone: function(tipoDeArea){
		$.each(VC.GSC.Configuracao.CamposDeTelefone, function(i, nomeDoAtributo){
			if(VC.GSC.existeCampo(nomeDoAtributo)){
				var maskVC = "00000000000";
				var maskEGX = "000000";
				var obj = VC.GSC.obterObjetoDoCap(nomeDoAtributo);
				
				if(tipoDeArea == "VC"){
					if (obj.control.is('input')) {
						// obj.control.unbind();
						obj.control.mask(maskVC);
					}
					obj.control.focusout(function(){
						var tamanhoNotaFiscal = obj.control.val().length;
						if(obj.control.val().length < 11 && obj.control.val().length != 6 && obj.control.val().length > 0){
							for(var i=0;i<15 - tamanhoNotaFiscal;i++){
								// obj.control.unbind();
								obj.control.val("0" + obj.control.val());
							}
						}
					});
				}
				
				else if(tipoDeArea == "EGX"){
					if (obj.control.is('input')) {
						obj.control.mask(maskEGX);
					}
					obj.control.focusout(function(){
						var tamanhoNotaFiscal = obj.control.val().length;
						if(obj.control.val().length < 6){
							for(var i=0;i<6 - tamanhoNotaFiscal;i++){
								obj.control.val("0" + obj.control.val());
							}
						}
					});
				}
				
				else{
					if (obj.control.is('input')) {
						obj.control.unmask();
					}
				}
			}
		});
	},

    ocultar: function () {
        $.each(VC.GSC.Configuracao.OcultarLinhas, function (i, nomeDoAtributo) {
            if (VC.GSC.existeCampo(nomeDoAtributo)) {
                VC.GSC.obterObjetoDoCap(nomeDoAtributo).row.hide();
            }
        });
    },

    configurarMascaraCNPJ: function () {
        if (typeof CAPContext != "undefined") {
            $.each(VC.GSC.Configuracao.CamposDeCNPJ, function (i, nomeDoAtributo) {
                if (VC.GSC.existeCampo(nomeDoAtributo)) {
                    var obj = VC.GSC.obterControleDoCap(nomeDoAtributo);
                    if (obj.is('input')) {
                        obj.mask("99.999.999/9999-99");
                    }
                }
                else {
                    console.log("O campo " + nomeDoAtributo + " não existe");
                }
            });
        }
        return false;
    },

    configurarMascaraCPF: function () {
        if (typeof CAPContext != "undefined") {
            $.each(VC.GSC.Configuracao.CamposDeCPF, function (i, nomeDoAtributo) {
                if (VC.GSC.existeCampo(nomeDoAtributo)) {
                    var obj = VC.GSC.obterControleDoCap(nomeDoAtributo);
                    if (obj.is('input')) {
                        obj.mask("990.999.999-99");
                    }
                }
                else {
                    console.log("O campo " + nomeDoAtributo + " não existe");
                }
            });
        }
        return false;
    },

    configurarMascaraDinheiro: function () {
        if (typeof CAPContext != "undefined") {
            $.each(VC.GSC.Configuracao.CamposDeDinheiro, function (i, nomeDoAtributo) {
                if (VC.GSC.existeCampo(nomeDoAtributo)) {
                    VC.GSC.obterControleDoCap(nomeDoAtributo).mask('000.000.000.000.000,00', { reverse: true });
                }
            });
        }
        return false;
    },
    existeCampo: function (displayValue) {
        var existe = false;
        if (typeof CAPContext != "undefined") {
            $.each(CAPContext.attributes, function (key, value) {
                if (value.name == displayValue) {
                    existe = true;
                    return;
                }
            });
        }
        return existe;
    },

    obterControleDoCap: function (displayValue) {
        if (typeof CAPContext != "undefined") {
            var idElemento = "";
            $.each(CAPContext.attributes, function (key, value) {
                if (value.name.toLowerCase() == displayValue.toLowerCase()) {
                    idElemento = key;
                    return;
                }
            });
            if (typeof CAPContext.attributes[idElemento] != "undefined") {
                return CAPContext.attributes[idElemento].control;
            }
        }
        return undefined;
    },

    obterObjetoDoCap: function (displayValue) {
        if (typeof CAPContext != "undefined") {
            var idElemento = "";
            $.each(CAPContext.attributes, function (key, value) {
                if (value.name.toLowerCase() == displayValue.toLowerCase()) {
                    idElemento = key;
                    return;
                }
            });
            if (typeof CAPContext.attributes[idElemento] != "undefined") {
                return CAPContext.attributes[idElemento];
            }
        }
        return undefined;
    },

    obterUsuarioCorrente: function () {
        var context = new SP.ClientContext.get_current();
        var web = context.get_web();
        VC.GSC.Configuracao.UsuarioCorrente = web.get_currentUser();
        context.load(VC.GSC.Configuracao.UsuarioCorrente);
        context.executeQueryAsync(
            Function.createDelegate(
                this,
                VC.GSC.obterUsuarioSuccess
            ),
            Function.createDelegate(
                this,
                VC.GSC.obterUsuarioFail
            )
        );
    },

    obterUsuarioSuccess: function (sender, args) {
        VC.GSC.Configuracao.UsuarioCorrente = VC.GSC.Configuracao.UsuarioCorrente.get_loginName();
        if (CAPContext.isRequestScreen) {
            objetoCampoVendedor = VC.GSC.obterObjetoDoCap("Solicitante");
            objetoCampoVendedor.row.select().find("[id$=editorDiv]").text(VC.GSC.Configuracao.UsuarioCorrente);
            objetoCampoVendedor.row.select().find("[id$=checkNamesImage1]").click();
        }
    },

    obterUsuarioFail: function (sender, args) {
        VC.GSC.Configuracao.UsuarioCorrente = "";
    },

    criaAbas: function () {
        var styleLICSS = "cursor: pointer; margin-right:10px; float:left; list-style:none;";
        var styleLabelCSS = "padding:5px 10px; display:inline-block; border:1px solid #BBB;";

        if (VC.GSC.Configuracao.TitulosDasAbas.length * 2 == VC.GSC.Configuracao.CamposLimitadores.length) {
            var tituloAba = "";
            var abaInicio = "";
            var abaFim = "";

            //cria a div e ul	
            if (CAPContext.currentWorkflowActionIndex == -1 && $("#additionalFieldsTable").length > 0) {
                $("#additionalFieldsTable").parent().prepend("<div style='width:100%; display: inline-block;'><ul id='abasContainer' style='padding-left: 0px'></ul></div><div style='clear:both;'></div>");
            }
            else {
                $("[id$=additionalFieldsSection]").children("td:last").prepend("<div style='width:100%; display: inline-block;'><ul id='abasContainer' style='padding-left: 0px'></ul></div><div style='clear:both;'></div>");
            }

            //captura titulos e atributos limitantes
            var indexCampo = 0;
            for (indexTitulo = 0; indexTitulo < VC.GSC.Configuracao.TitulosDasAbas.length; indexTitulo++) {
                tituloAba = VC.GSC.Configuracao.TitulosDasAbas[indexTitulo];
                abaInicio = VC.GSC.Configuracao.CamposLimitadores[indexCampo];
                abaFim = VC.GSC.Configuracao.CamposLimitadores[indexCampo + 1];
                if (VC.GSC.existeCampo(abaInicio) && VC.GSC.existeCampo(abaFim)) {
                    $("#abasContainer").append("<li cap-fieldOrder1=" + indexCampo + " cap-fieldOrder2=" + (indexCampo + 1) + " id='custom_aba" + indexTitulo + "' style='" + styleLICSS + "'><label style='" + styleLabelCSS + "'>" + tituloAba + "<span style='color:red; display: none;'>&nbsp;*</span></label></li>");
                    indexCampo += 2;
                }
                else {
                    console.log("Um ou mais atributos de limitadores de abas não existe");
                    return;
                }
            }

            //cria o evento click nas abas	
            $("li[id*='custom_aba']").bind("click", function () {
                VC.GSC.unselectAll();
                VC.GSC.selectAba(this);
                VC.GSC.showAndHideFields(this);
            });

            //inicia com a primeira aba selecionada
            $("li[id*='custom_aba0']").click();
        }
        else {
            console.log("O Número de títulos de abas é inconsistente com o número de atributos delimitantes");
        }
    },

    selectAba: function (obj) {
        $(obj).css('background', '#bbb');
    },

    unselectAll: function () {
        $("#abasContainer li").each(function () {
            $(this).css('background', '#f6f6f6');
        });
    },

    showAndHideFields: function (obj) {
        var ini = VC.GSC.obterObjetoDoCap(
            VC.GSC.Configuracao.CamposLimitadores[$(obj).attr("cap-fieldOrder1")]
        ).displayOrder;
        var end = VC.GSC.obterObjetoDoCap(
            VC.GSC.Configuracao.CamposLimitadores[parseInt($(obj).attr("cap-fieldOrder2"))]
        ).displayOrder;
        var attributes = VC.GSC.sortCAPContextAttributes();

        $.each(attributes, function (i, item) {
            if (item[1] >= ini && item[1] <= end) {
                CAPContext.attributes[item[0]].row.show();
            }
            else {
                CAPContext.attributes[item[0]].row.hide();
            }
        });
    },

    sortCAPContextAttributes: function () {
        var sortable = [];
        for (var attribute in CAPContext.attributes)
            sortable.push([attribute, CAPContext.attributes[attribute].displayOrder]);
        sortable.sort(function (a, b) { return a[1] - b[1] });
        return sortable;
    },

    selecionaPrimeiroValorDaDrop: function (controleFlag, controleAlvo) {
        if (controleFlag.val() != "__SELECT__") {
            if ($(controleAlvo).children('option').length == 1) {
                setTimeout(function () { }, 1000);
            }
            else {
                var valueFromDrop = $(controleAlvo)[0].options[1].text;
                $(controleAlvo).val(valueFromDrop);
            }
        }
    },

    previneAjax: function (controleFlag, controleAlvo) {
        VC.GSC.selecionaPrimeiroValorDaDrop(controleFlag, controleAlvo);
        $(document).ajaxStop(function () {
            VC.GSC.selecionaPrimeiroValorDaDrop(controleFlag, controleAlvo);
        });
    },

    restringeNumerosDeAnexos: function (objetoAnexo, quantidade) {
        if (objetoAnexo.row.find('div[id$=_uploadedFilesContainer]').children().length > quantidade) {
            alert('O limite máximo de arquivos para anexos é de ' + quantidade);
            var realConfirm = window.confirm;
            window.confirm = function () {
                window.confirm = realConfirm;
                return true;
            };
            objetoAnexo.row.find('img[class^=fileUploadEntry]').last().click();
        }
    },

    //Informações do Solicitante
    adicionarSeparador: function (nomeDoCampo, titulo) {
        if (VC.GSC.existeCampo(nomeDoCampo)) {
            VC.GSC.obterObjetoDoCap(nomeDoCampo).row.before("<tr><td colspan=2 style='border-bottom: 1px solid #d8d8d8; font-weight: bold; line-height: 25px; padding-top: 10px;'>" + titulo + "</td></tr>");
        }
        else {
            console.log("Não existe o campo:" + nomeDoCampo);
        }
    },

    blockUserInterface: function (mensagem) {
        var strMessage = (mensagem == undefined || mensagem == "") ? "Carregando" : mensagem;
        $.blockUI({
            message: '<p class="loader" style="padding-right: 20px" >' + strMessage + '</p>',
            overlayCSS: {
                opacity: 0.2
            },
            css: {
                margin: '0px 0px 0px 0px',
                border: 'none',
                padding: '15px',
                backgroundColor: '#fff',
                opacity: 1,
                color: '#000',
                width: '300px',
                height: '30px'
            }
        });
    },

    unblockUserInterface: function () {
        $.unblockUI();
    }

});

VC.GSC.Cliente = VC.GSC.Cliente || {
    Configuracao: {
        Lista: "Configurations",
        Chave: "IntegracaoXD",
        IntegracaoU: "",
        IntegracaoS: "",
        CollListItem: null,
        CampoCodigoEmissor: "Código Emissor",
        CampoRazao: "Razão Social",
        CampoCNPJ: "CNPJ",
        CampoRegional: "Regional",
        CampoEstado: "UF - Cliente",
        RelacaoEstadoRegional: {
            'PR': 'Sul', 'RS': 'Sul', 'SC': 'Sul', 'ES': 'Sudeste', 'MG': 'Sudeste', 'RJ': 'Sudeste', 'SP': 'Sudeste',
            'AC': 'Centro Norte', 'AM': 'Centro Norte', 'AP': 'Centro Norte', 'DF': 'Centro Norte', 'GO': 'Centro Norte', 'MS': 'Centro Norte',
            'MT': 'Centro Norte', 'PA': 'Centro Norte', 'RO': 'Centro Norte', 'RR': 'Centro Norte', 'TO': 'Centro Norte', 'AL': 'Nordeste',
            'BA': 'Nordeste', 'CE': 'Nordeste', 'MA': 'Nordeste', 'PB': 'Nordeste', 'PE': 'Nordeste', 'PI': 'Nordeste', 'RN': 'Nordeste',
            'SE': 'Nordeste'
        }
    },

    init: function () {
        VC.GSC.Cliente.configurarCliente();
    },

    obterSOAPMessage: function (codigoEmissor) {
        var soapMessage = '                <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">                    <soap:Body>                        <GetClientData xmlns="http://tempuri.org/">                            <codigoCliente>' + codigoEmissor + '</codigoCliente>                        </GetClientData>                    </soap:Body>                </soap:Envelope>';
        return soapMessage;
    },

    alteraVisualizacaoCampo: function (controle, valor) {
        if (controle.parent().children('label').length == 0) {
            controle.parent().append('<label>' + valor + '</label>');
        }
        else {
            $(controle.parent().children('label')).text(valor);
        }
    },

    buscaClienteOnSuccess: function (data, status) {
        try {
            var strResultado = $(data).find('GetClientDataResult').text().toString();
            var configuracao = VC.GSC.Cliente.Configuracao;
            objResultado = $.parseJSON(strResultado);
            if (parseInt(objResultado.STATUS) == 0) {

                ctlRazao = VC.GSC.obterControleDoCap(VC.GSC.Cliente.Configuracao.CampoRazao);
                ctlEstado = VC.GSC.obterControleDoCap(VC.GSC.Cliente.Configuracao.CampoEstado);
                ctlCNPJ = VC.GSC.obterControleDoCap(VC.GSC.Cliente.Configuracao.CampoCNPJ);
                ctlRegional = VC.GSC.obterControleDoCap(VC.GSC.Cliente.Configuracao.CampoRegional);

                ctlRazao = VC.GSC.obterControleDoCap(configuracao.CampoRazao);
                valor = objResultado.NAME1 == null ? "" : objResultado.NAME1;
                ctlRazao.val(valor);
                VC.GSC.Cliente.alteraVisualizacaoCampo(ctlRazao, valor);

                ctlCNPJ = VC.GSC.obterControleDoCap(configuracao.CampoCNPJ);
                valor = objResultado.STCD1 == null ? "" : VC.GSC.formatarDocumento(objResultado.STCD1);
                ctlCNPJ.val(valor);
                VC.GSC.Cliente.alteraVisualizacaoCampo(ctlCNPJ, valor);

                ctlUF = VC.GSC.obterControleDoCap(configuracao.CampoEstado);
                valor = objResultado.UF == null ? "" : objResultado.UF;
                ctlUF.val(valor);
                VC.GSC.Cliente.alteraVisualizacaoCampo(ctlUF, valor);

                if (valor != "") {
                    ctlRegional = VC.GSC.obterControleDoCap(configuracao.CampoRegional);
                    valor = configuracao.RelacaoEstadoRegional[objResultado.UF];
                    ctlRegional.val(valor);
                    VC.GSC.Cliente.alteraVisualizacaoCampo(ctlRegional, valor);
                }
            }
            else {
                alert("Ocorreu um erro ao buscar o cliente através do código.");
                console.log("Comentário do Erro da Integração da XD: " + objResultado.COMMENT);
            }
        }
        catch (e) {
            console.log('erro:' + e.message);
            VC.GSC.unblockUserInterface();
        }
        VC.GSC.unblockUserInterface();
    },

    buscaClienteOnError: function (request, status, error) {
        console.log('Erro na chamada do serviço do cliente');
        VC.GSC.unblockUserInterface();
    },

    configurarCliente: function () {
        if (VC.GSC.existeCampo(this.Configuracao.CampoCNPJ) && VC.GSC.existeCampo(this.Configuracao.CampoRegional) &&
           VC.GSC.existeCampo(this.Configuracao.CampoEstado) && VC.GSC.existeCampo(this.Configuracao.CampoRazao) &&
           VC.GSC.existeCampo(this.Configuracao.CampoCodigoEmissor)) {
            ctlEmissor = VC.GSC.obterControleDoCap(this.Configuracao.CampoCodigoEmissor);
            ctlRazao = VC.GSC.obterControleDoCap(this.Configuracao.CampoRazao);
            ctlEstado = VC.GSC.obterControleDoCap(this.Configuracao.CampoEstado);
            ctlCNPJ = VC.GSC.obterControleDoCap(this.Configuracao.CampoCNPJ);
            ctlRegional = VC.GSC.obterControleDoCap(this.Configuracao.CampoRegional);
            if (!ctlEmissor.is('input') || !ctlRazao.is('input') || !ctlEstado.is('input') || !ctlCNPJ.is('input') && !ctlRegional.is('input')) {
                console.log('Um dos outros atributos não está editável.');
                return;
            }

            this.alteraVisualizacaoCampo(ctlRazao, "");
            ctlRazao.hide();

            this.alteraVisualizacaoCampo(ctlEstado, "");
            ctlEstado.hide();

            this.alteraVisualizacaoCampo(ctlCNPJ, "");
            ctlCNPJ.hide();

            this.alteraVisualizacaoCampo(ctlRegional, "");
            ctlRegional.hide();


            ctlEmissor.focusout(function (e) {
                try {
                    var valorSelecionado = $(this).val();
                    var ctl1 = VC.GSC.obterControleDoCap(VC.GSC.Cliente.Configuracao.CampoRazao);
                    var ctl2 = VC.GSC.obterControleDoCap(VC.GSC.Cliente.Configuracao.CampoEstado);
                    var ctl3 = VC.GSC.obterControleDoCap(VC.GSC.Cliente.Configuracao.CampoCNPJ);
                    var ctl4 = VC.GSC.obterControleDoCap(VC.GSC.Cliente.Configuracao.CampoRegional);

                    ctl1.val("");
                    ctl2.val("");
                    ctl3.val("");
                    ctl4.val("");
                    VC.GSC.Cliente.alteraVisualizacaoCampo(ctl1, "");
                    VC.GSC.Cliente.alteraVisualizacaoCampo(ctl2, "");
                    VC.GSC.Cliente.alteraVisualizacaoCampo(ctl3, "");
                    VC.GSC.Cliente.alteraVisualizacaoCampo(ctl4, "");

                    if (valorSelecionado != "") {
                        VC.GSC.blockUserInterface();
                        var uri = _spPageContextInfo.webAbsoluteUrl + "/_vti_bin/iteris/ExtensionsCAP/SAPWebService.asmx";
                        var soapAction = "http://tempuri.org/GetClientData";
                        $.ajax({
                            url: uri,
                            dataType: "xml",
                            type: "POST",
                            soapAction: soapAction,
                            contentType: "text/xml; charset=utf-8",
                            data: VC.GSC.Cliente.obterSOAPMessage(valorSelecionado),
                            success: VC.GSC.Cliente.buscaClienteOnSuccess,
                            error: VC.GSC.Cliente.buscaClienteOnError
                        });
                    }
                }
                catch (e) {
                    VC.GSC.unblockUserInterface();
                }
            });
        }
    }
}

VC.GSC.OTC = VC.GSC.OTC || {
    Configuracao: {
        CampoCausaRaiz: "Causa Raiz",
        CampoFrenteOTC: "Frente OTC",
        CampoErroOuRotina: "Erro ou Rotina",
        CampoAcao: "Ação",
        CampoFiltroFrenteOTC: "Causa Raiz",
        CampoFiltroErroOuRotina: "Causa Raiz",
        CampoFiltroAcao: "Causa Raiz",
        CampoFiltroCausaRaiz: "Causa Raiz",
        FiltroErroOuRotina: [],
        FiltroAcao: [],
        FiltroFrenteOTC: [],
        FiltroCausaRaiz: [
      {'FO':'Cadastrar Clientes','AC':'Cadastrar Cliente, Pagador ou Obra','CR':'Cad - Erro sistema 297','ER':'Erro'},
      {'FO':'Captar Pedido - COM EXT','AC':'Cadastrar Cliente, Pagador ou Obra','CR':'Com - Erro no WTM','ER':'Erro'}
        ]
    },

    habilitarTodasOpcoes: function (controle) {
        var opcoesOcultas = controle.find('span');
        $.each(opcoesOcultas, function (i, value) {
            $(value).find('option').unwrap();
        });
    },

    ocultarTodasOpcoes: function (controle) {
        var opcoes = controle.find('option');
        $.each(opcoes, function (i, value) {
            if (i > 0 && !$(value).parent().is('span'))
                $(value).wrap("<span>");
        });

    },

    ocultarOpcoes: function (controle, arrValores) {
        $.each(arrValores, function (i, value) {
            if (!controle.find("[value='" + value + "']").parent().is('span'));
            controle.find("[value='" + value + "']").wrap("<span>");
        });
    },

    habilitarOpcoes: function (controle, arrValores) {
        $.each(arrValores, function (i, value) {
            controle.find("[value='" + value + "']").unwrap();
        });
    },

    filtrarCausaRaiz: function () {
        var controleCausaRaiz = VC.GSC.obterControleDoCap(VC.GSC.OTC.Configuracao.CampoCausaRaiz);			
        $(VC.GSC.obterControleDoCap(VC.GSC.OTC.Configuracao.CampoFiltroCausaRaiz)).change(function () {
            var valorFiltro;
            if (VC.GSC.obterControleDoCap(VC.GSC.OTC.Configuracao.CampoFiltroCausaRaiz).is('select')) {
                valorFiltro = VC.GSC.obterControleDoCap(VC.GSC.OTC.Configuracao.CampoFiltroCausaRaiz).val();
            }
            else {
                valorFiltro = VC.GSC.obterControleDoCap(VC.GSC.OTC.Configuracao.CampoFiltroCausaRaiz).text().trim();
            }
            var valores = VC.GSC.OTC.Configuracao.FiltroCausaRaiz[valorFiltro];
            var valoresVisiveis = [];
            if (valores != undefined) {
                VC.GSC.OTC.ocultarTodasOpcoes(controleCausaRaiz);
                $.each(valores, function (key, value) {
                    var causaRaiz = value['CR'];
                    valoresVisiveis.push(causaRaiz);
                });
                VC.GSC.OTC.Configuracao.FiltroErroOuRotina = VC.GSC.OTC.Configuracao.FiltroErroOuRotina.concat(valores);
                VC.GSC.OTC.Configuracao.FiltroFrenteOTC = VC.GSC.OTC.Configuracao.FiltroFrenteOTC.concat(valores);
                VC.GSC.OTC.Configuracao.FiltroAcao = VC.GSC.OTC.Configuracao.FiltroAcao.concat(valores);
                VC.GSC.OTC.habilitarOpcoes(controleCausaRaiz, valoresVisiveis);
            }
        });

        var valorFiltro;
        if (VC.GSC.obterControleDoCap(VC.GSC.OTC.Configuracao.CampoFiltroCausaRaiz).is('select')) {
            valorFiltro = VC.GSC.obterControleDoCap(VC.GSC.OTC.Configuracao.CampoFiltroCausaRaiz).val();
        }
        else {
            valorFiltro = VC.GSC.obterControleDoCap(VC.GSC.OTC.Configuracao.CampoFiltroCausaRaiz).text().trim();
        }
        var valores = VC.GSC.OTC.Configuracao.FiltroCausaRaiz[valorFiltro];
        var valoresVisiveis = [];
        if (valores != undefined) {
            VC.GSC.OTC.ocultarTodasOpcoes(controleCausaRaiz);
            $.each(valores, function (key, value) {
                var causaRaiz = value['CR'];
                valoresVisiveis.push(causaRaiz);
            });
            VC.GSC.OTC.Configuracao.FiltroErroOuRotina = VC.GSC.OTC.Configuracao.FiltroErroOuRotina.concat(valores);
            VC.GSC.OTC.Configuracao.FiltroFrenteOTC = VC.GSC.OTC.Configuracao.FiltroFrenteOTC.concat(valores);
            VC.GSC.OTC.Configuracao.FiltroAcao = VC.GSC.OTC.Configuracao.FiltroAcao.concat(valores);
            VC.GSC.OTC.habilitarOpcoes(controleCausaRaiz, valoresVisiveis);
        }
    },

    filtrarErroOuRotina: function () {
        if (this.Configuracao.CampoFiltroErroOuRotina != "" && VC.GSC.existeCampo(this.Configuracao.CampoFiltroErroOuRotina)) {
            var controle = VC.GSC.obterControleDoCap(this.Configuracao.CampoErroOuRotina);
            if (!(controle.is('input') || controle.is('select'))) {
                console.log('controle não editável');
                return;
            }

            if (VC.GSC.obterControleDoCap(VC.GSC.OTC.Configuracao.CampoCausaRaiz).val() != "__SELECT__") {
                var valorFiltro = VC.GSC.obterControleDoCap(VC.GSC.OTC.Configuracao.CampoCausaRaiz).val();
                var valErroOuRotina = "";
                $.each(VC.GSC.OTC.Configuracao.FiltroErroOuRotina, function (i, value) {
                    if (value['CR'] == valorFiltro) {
                        valErroOuRotina = value["ER"];
                        VC.GSC.obterControleDoCap(VC.GSC.OTC.Configuracao.CampoErroOuRotina).val(valErroOuRotina);
                        return;
                    }
                });
                if (controle.closest('td').find('label').length == 0) {
                    controle.closest('td').append("<label>" + valErroOuRotina + "</label>");
                }
                else {
                    controle.closest('td').find('label').text(valErroOuRotina);
                }
                if (controle.val() == "__SELECT__") {
                    controle.closest('td').find('label').text('');
                }
            }

            VC.GSC.obterControleDoCap(this.Configuracao.CampoFiltroErroOuRotina).change(function () {
                var valorFiltro = $(this).val();
                var valErroOuRotina = "";
                $.each(VC.GSC.OTC.Configuracao.FiltroErroOuRotina, function (i, value) {
                    if (value['CR'] == valorFiltro) {
                        valErroOuRotina = value["ER"];
                        VC.GSC.obterControleDoCap(VC.GSC.OTC.Configuracao.CampoErroOuRotina).val(valErroOuRotina);
                        return;
                    }
                });
                if (controle.closest('td').find('label').length == 0) {
                    controle.closest('td').append("<label>" + valErroOuRotina + "</label>");
                }
                else {
                    controle.closest('td').find('label').text(valErroOuRotina);
                }
                if (controle.val() == "__SELECT__") {
                    controle.closest('td').find('label').text('');
                }
            });
        }
    },

    filtrarFrenteOTC: function () {
        if (this.Configuracao.CampoFiltroFrenteOTC != "" && VC.GSC.existeCampo(this.Configuracao.CampoFiltroFrenteOTC)) {
            var controle = VC.GSC.obterControleDoCap(this.Configuracao.CampoFrenteOTC);
            if (!(controle.is('input') || controle.is('select'))) {
                console.log('controle não editável');
                return;
            }

            if (VC.GSC.obterControleDoCap(VC.GSC.OTC.Configuracao.CampoCausaRaiz).val() != "__SELECT__") {
                var valorFiltro = VC.GSC.obterControleDoCap(VC.GSC.OTC.Configuracao.CampoCausaRaiz).val();
                var valFrenteOTC = "";
                $.each(VC.GSC.OTC.Configuracao.FiltroFrenteOTC, function (i, value) {
                    if (value['CR'] == valorFiltro) {
                        valFrenteOTC = value["FO"];
                        controle.val(valFrenteOTC);
                        return;
                    }
                });
                if (controle.closest('td').find('label').length == 0) {
                    controle.closest('td').append("<label>" + valFrenteOTC + "</label>");
                }
                else {
                    controle.closest('td').find('label').text(valFrenteOTC);
                }
                if (controle.val() == "__SELECT__") {
                    controle.closest('td').find('label').text('');
                }
            }

            VC.GSC.obterControleDoCap(this.Configuracao.CampoFiltroFrenteOTC).change(function () {
                var valorFiltro = $(this).val();
                var valFrenteOTC = "";
                $.each(VC.GSC.OTC.Configuracao.FiltroFrenteOTC, function (i, value) {
                    if (value['CR'] == valorFiltro) {
                        valFrenteOTC = value["FO"];
                        controle.val(valFrenteOTC);
                        return;
                    }
                });
				
                if (controle.closest('td').find('label').length == 0) {
                    controle.closest('td').append("<label>" + valFrenteOTC + "</label>");
                }
                else {
                    controle.closest('td').find('label').text(valFrenteOTC);
                }
                if (controle.val() == "__SELECT__") {
                    controle.closest('td').find('label').text('');
                }
            });
        }
    },

    filtrarAcao: function () {
        if (this.Configuracao.CampoFiltroAcao != "" && VC.GSC.existeCampo(this.Configuracao.CampoFiltroAcao)) {
            var controle = VC.GSC.obterControleDoCap(this.Configuracao.CampoAcao);
            if (!(controle.is('input') || controle.is('select'))) {
                console.log('controle não editável');
                return;
            }

            if (VC.GSC.obterControleDoCap(VC.GSC.OTC.Configuracao.CampoCausaRaiz).val() != "__SELECT__") {
                var valorFiltro = VC.GSC.obterControleDoCap(VC.GSC.OTC.Configuracao.CampoCausaRaiz).val();
                var valAcao = "";
                $.each(VC.GSC.OTC.Configuracao.FiltroAcao, function (i, value) {
                    if (value['CR'] == valorFiltro) {
                        valAcao = value["AC"];
                        controle.val(valAcao);
                        return;
                    }
                });
                if (controle.closest('td').find('label').length == 0) {
                    controle.closest('td').append("<label>" + valAcao + "</label>");
                }
                else {
                    controle.closest('td').find('label').text(valAcao);
                }
                if (controle.val() == "__SELECT__") {
                    controle.closest('td').find('label').text('');
                }
            }

            VC.GSC.obterControleDoCap(this.Configuracao.CampoFiltroAcao).change(function () {
                var valorFiltro = $(this).val();
                var valAcao = "";
                $.each(VC.GSC.OTC.Configuracao.FiltroAcao, function (i, value) {
                    if (value['CR'] == valorFiltro) {
                        valAcao = value["AC"];
                        controle.val(valAcao);
                        return;
                    }
                });
                if (controle.closest('td').find('label').length == 0) {
                    controle.closest('td').append("<label>" + valAcao + "</label>");
                }
                else {
                    controle.closest('td').find('label').text(valAcao);
                }
                if (controle.val() == "__SELECT__") {
                    controle.closest('td').find('label').text('');
                }
            });
        }
    },

    init: function () {
        if (CAPContext.currentWorkflowActionIndex == 0 ||
            CAPContext.currentWorkflowActionIndex == 1 ||
            CAPContext.currentWorkflowActionIndex == 2 ||
            CAPContext.currentWorkflowActionIndex == 3){
            VC.GSC.obterControleDoCap(this.Configuracao.CampoFrenteOTC).hide();
            VC.GSC.obterControleDoCap(this.Configuracao.CampoErroOuRotina).hide();
            VC.GSC.obterControleDoCap(this.Configuracao.CampoAcao).hide();
	    VC.GSC.OTC.Configuracao.FiltroErroOuRotina = VC.GSC.OTC.Configuracao.FiltroCausaRaiz;
	    VC.GSC.OTC.Configuracao.FiltroAcao = VC.GSC.OTC.Configuracao.FiltroCausaRaiz;
	    VC.GSC.OTC.Configuracao.FiltroFrenteOTC = VC.GSC.OTC.Configuracao.FiltroCausaRaiz;
			
            this.filtrarErroOuRotina();
            this.filtrarAcao();
            this.filtrarFrenteOTC();
        }
    }
};

function removeOuAdicionaObrigatoriedade(campo, obrigatorio) {
    campo.closest('td').find("span[id$=_RequiredFieldValidator]").prop('enabled', obrigatorio);
    if (obrigatorio) {
        campo.closest('tr').find('span[title=Requerido]').show();
    }
    else {
        campo.closest('tr').find('span[title=Requerido]').hide();
    }
}

function configurarSeparadores(){
	VC.GSC.adicionarSeparador("Empresa", "Informações do Solicitante");

	if(CAPContext.currentWorkflowActionIndex >= 0){
		VC.GSC.adicionarSeparador("Ação Cadastro", "Informações da ADM Vendas - Analisar Solicitação");
	}

	if(CAPContext.currentWorkflowActionIndex >= 1){
	var controleDiag = VC.GSC.obterControleDoCap('O que deseja cadastrar?').text().trim();
        	if (controleDiag == "CNOB") {
		VC.GSC.adicionarSeparador("Foi possível cadastrar o cliente CPF?", "Informações do CSC Cadastro - Cadastrar Obra");
		}

		else if (controleDiag == "Pagador") {
		VC.GSC.adicionarSeparador("Foi possível cadastrar o cliente CPF?", "Informações do CSC Cadastro - Cadastrar Pagador");
		}

		else if (controleDiag == "Cliente CNPJ") {
		VC.GSC.adicionarSeparador("Foi possível cadastrar o cliente CPF?", "Informações do CSC Cadastro - Cadastrar Cliente CNPJ");
		}

		else if (controleDiag == "Cliente CPF") {
		VC.GSC.adicionarSeparador("Foi possível cadastrar o cliente CPF?", "Informações do CSC Cadastro - Cadastrar Cliente CPF");
		}
	}

	if(CAPContext.currentWorkflowActionIndex >= 2){
		VC.GSC.adicionarSeparador("Diagnóstico Fiscal", "Informações do Fiscal - Analisar Solicitação");
	}

	if(CAPContext.currentWorkflowActionIndex >= 3){
		VC.GSC.adicionarSeparador("Diagnóstico CSC Cadastro - Retorno", "Informações do CSC Cadastro - Analisar Retorno");
	}
}

function validarAnexos(){
	if(VC.GSC.existeCampo('Anexo')){
		var objetoAnexo = VC.GSC.obterObjetoDoCap('Anexo');
		objetoAnexo.row.change(function(){
            var objetoAnexo = VC.GSC.obterObjetoDoCap('Anexo');
			VC.GSC.restringeNumerosDeAnexos(objetoAnexo, 5);
		});
	}
}

function definirLayoutSLA(){
	if(VC.GSC.existeCampo('SLA Total (hr)')){
		var controleSLA = VC.GSC.obterControleDoCap('SLA Total (hr)');
		controleSLA.text(controleSLA.text().trim());
		controleSLA.closest('td').css("color", "blue").css("font-weight", "bold");
	}
}

function validarDiagnostico(){
	if(CAPContext.currentWorkflowActionIndex == 1 && VC.GSC.existeCampo('Diagnóstico CSC Cadastro')) {
	var controleRemessa = VC.GSC.obterControleDoCap('Diagnóstico CSC Cadastro');
        var objetoNumreme = VC.GSC.obterObjetoDoCap('Causa Raiz da Improcedência');
        objetoNumreme.row.hide();

	controleRemessa.change(function(){
	var controleRemessa = VC.GSC.obterControleDoCap('Diagnóstico CSC Cadastro');
	var objetoNumreme = VC.GSC.obterObjetoDoCap('Causa Raiz da Improcedência');

	if (controleRemessa.val() == "Procedente") {
		objetoNumreme.row.hide();
		removeOuAdicionaObrigatoriedade(objetoNumreme.control, false);
	}
    	else {
		objetoNumreme.row.show();
		removeOuAdicionaObrigatoriedade(objetoNumreme.control, true);
    		}
	});
        
	$('#outcomeRadio_Continue').click(function () {
	var controleRemessa = VC.GSC.obterControleDoCap('Diagnóstico CSC Cadastro');
	var objetoNumreme = VC.GSC.obterObjetoDoCap('Causa Raiz da Improcedência');

	if (controleRemessa.val() == "Procedente") {
		objetoNumreme.row.hide();
		removeOuAdicionaObrigatoriedade(objetoNumreme.control, false);
		}
        	});
       }

	if(CAPContext.currentWorkflowActionIndex == 2 && VC.GSC.existeCampo('Diagnóstico Fiscal')) {
	var controleRemessa = VC.GSC.obterControleDoCap('Diagnóstico Fiscal');
        var objetoNumreme = VC.GSC.obterObjetoDoCap('Causa Raiz da Improcedência');
        objetoNumreme.row.hide();

	controleRemessa.change(function(){
	var controleRemessa = VC.GSC.obterControleDoCap('Diagnóstico Fiscal');
	var objetoNumreme = VC.GSC.obterObjetoDoCap('Causa Raiz da Improcedência');

	if (controleRemessa.val() == "Procedente") {
		objetoNumreme.row.hide();
		removeOuAdicionaObrigatoriedade(objetoNumreme.control, false);
	}
    	else {
		objetoNumreme.row.show();
		removeOuAdicionaObrigatoriedade(objetoNumreme.control, true);
    		}
	});
        
	$('#outcomeRadio_Continue').click(function () {
	var controleRemessa = VC.GSC.obterControleDoCap('Diagnóstico Fiscal');
	var objetoNumreme = VC.GSC.obterObjetoDoCap('Causa Raiz da Improcedência');

	if (controleRemessa.val() == "Procedente") {
		objetoNumreme.row.hide();
		removeOuAdicionaObrigatoriedade(objetoNumreme.control, false);
		}
        	});
        }

	if(CAPContext.currentWorkflowActionIndex == 3 && VC.GSC.existeCampo('Diagnóstico CSC Cadastro - Retorno')) {
	var controleRemessa = VC.GSC.obterControleDoCap('Diagnóstico CSC Cadastro - Retorno');
        var objetoNumreme = VC.GSC.obterObjetoDoCap('Causa Raiz da Improcedência');
        objetoNumreme.row.hide();

	controleRemessa.change(function(){
	var controleRemessa = VC.GSC.obterControleDoCap('Diagnóstico CSC Cadastro - Retorno');
	var objetoNumreme = VC.GSC.obterObjetoDoCap('Causa Raiz da Improcedência');

	if (controleRemessa.val() == "Procedente") {
		objetoNumreme.row.hide();
		removeOuAdicionaObrigatoriedade(objetoNumreme.control, false);
	}
    	else {
		objetoNumreme.row.show();
		removeOuAdicionaObrigatoriedade(objetoNumreme.control, true);
    		}
	});
        
	$('#outcomeRadio_Continue').click(function () {
	var controleRemessa = VC.GSC.obterControleDoCap('Diagnóstico CSC Cadastro - Retorno');
	var objetoNumreme = VC.GSC.obterObjetoDoCap('Causa Raiz da Improcedência');

	if (controleRemessa.val() == "Procedente") {
		objetoNumreme.row.hide();
		removeOuAdicionaObrigatoriedade(objetoNumreme.control, false);
		}
        	});
       }
}

function validarRegras(){
	if(CAPContext.currentWorkflowActionIndex == -1) {
	var controleDiag = VC.GSC.obterControleDoCap('O que deseja cadastrar?');
	var objeto2 = VC.GSC.obterObjetoDoCap('Código Emissor');
 	var objeto3 = VC.GSC.obterObjetoDoCap('Razão Social');
 	var objeto4 = VC.GSC.obterObjetoDoCap('CNPJ');
 	var objeto5 = VC.GSC.obterObjetoDoCap('Regional');
 	var objeto6 = VC.GSC.obterObjetoDoCap('UF - Cliente');
 	var objeto7 = VC.GSC.obterObjetoDoCap('CNPJ Cliente');
 	var objeto8 = VC.GSC.obterObjetoDoCap('CPF');
 	var objeto9 = VC.GSC.obterObjetoDoCap('Razão Social Cliente');
 	var objeto10 = VC.GSC.obterObjetoDoCap('Logradouro');
 	var objeto11 = VC.GSC.obterObjetoDoCap('Nº Logradouro');
 	var objeto12 = VC.GSC.obterObjetoDoCap('Andar');
	var objeto13 = VC.GSC.obterObjetoDoCap('Bairro');
 	var objeto14 = VC.GSC.obterObjetoDoCap('CEP');
 	var objeto15 = VC.GSC.obterObjetoDoCap('Complemento');
 	var objeto16 = VC.GSC.obterObjetoDoCap('Cidade');
 	var objeto17 = VC.GSC.obterObjetoDoCap('UF');
 	var objeto20 = VC.GSC.obterObjetoDoCap('Data de Nascimento do Cliente');
 	var objeto22 = VC.GSC.obterObjetoDoCap('Tipo de Pagador');
 	var objeto30 = VC.GSC.obterObjetoDoCap('Obra precisa de Descarga na Fumaça?');
 	var objeto31 = VC.GSC.obterObjetoDoCap('Obra precisa de Descarga no Cliente?');
 	var objeto32 = VC.GSC.obterObjetoDoCap('Obra Paletizada?');
 	var objeto35 = VC.GSC.obterObjetoDoCap('Logradouro da obra');
 	var objeto36 = VC.GSC.obterObjetoDoCap('Nº Logradouro da obra');
 	var objeto37 = VC.GSC.obterObjetoDoCap('Andar da obra');
 	var objeto38 = VC.GSC.obterObjetoDoCap('Bairro da obra');
 	var objeto39 = VC.GSC.obterObjetoDoCap('CEP da obra');
 	var objeto40 = VC.GSC.obterObjetoDoCap('Complemento da obra');
 	var objeto41 = VC.GSC.obterObjetoDoCap('Cidade da obra');
 	var objeto42 = VC.GSC.obterObjetoDoCap('UF da obra');
 	var objeto43 = VC.GSC.obterObjetoDoCap('Inscrição Estadual');
 	var objeto44 = VC.GSC.obterObjetoDoCap('Código do Representante');

	objeto2.row.hide();
	objeto3.row.hide();
	objeto4.row.hide();
	objeto5.row.hide();
	objeto6.row.hide();
	objeto7.row.hide();
	objeto8.row.hide();
	objeto9.row.hide();
	objeto10.row.hide();
	objeto11.row.hide();
	objeto12.row.hide();
	objeto13.row.hide();
	objeto14.row.hide();
	objeto15.row.hide();
	objeto16.row.hide();
	objeto17.row.hide();
	objeto20.row.hide();
	objeto22.row.hide();
	objeto30.row.hide();
	objeto31.row.hide();
	objeto32.row.hide();
	objeto35.row.hide();
	objeto36.row.hide();
	objeto37.row.hide();
	objeto38.row.hide();
	objeto39.row.hide();
	objeto40.row.hide();
	objeto41.row.hide();
	objeto42.row.hide();
	objeto43.row.hide();
	objeto44.row.hide();

	controleDiag.change(function(){
	var controleDiag = VC.GSC.obterControleDoCap('O que deseja cadastrar?');
	var objeto2 = VC.GSC.obterObjetoDoCap('Código Emissor');
 	var objeto3 = VC.GSC.obterObjetoDoCap('Razão Social');
 	var objeto4 = VC.GSC.obterObjetoDoCap('CNPJ');
 	var objeto5 = VC.GSC.obterObjetoDoCap('Regional');
 	var objeto6 = VC.GSC.obterObjetoDoCap('UF - Cliente');
 	var objeto7 = VC.GSC.obterObjetoDoCap('CNPJ Cliente');
 	var objeto8 = VC.GSC.obterObjetoDoCap('CPF');
 	var objeto9 = VC.GSC.obterObjetoDoCap('Razão Social Cliente');
 	var objeto10 = VC.GSC.obterObjetoDoCap('Logradouro');
 	var objeto11 = VC.GSC.obterObjetoDoCap('Nº Logradouro');
 	var objeto12 = VC.GSC.obterObjetoDoCap('Andar');
	var objeto13 = VC.GSC.obterObjetoDoCap('Bairro');
 	var objeto14 = VC.GSC.obterObjetoDoCap('CEP');
 	var objeto15 = VC.GSC.obterObjetoDoCap('Complemento');
 	var objeto16 = VC.GSC.obterObjetoDoCap('Cidade');
 	var objeto17 = VC.GSC.obterObjetoDoCap('UF');
 	var objeto20 = VC.GSC.obterObjetoDoCap('Data de Nascimento do Cliente');
 	var objeto22 = VC.GSC.obterObjetoDoCap('Tipo de Pagador');
 	var objeto30 = VC.GSC.obterObjetoDoCap('Obra precisa de Descarga na Fumaça?');
 	var objeto31 = VC.GSC.obterObjetoDoCap('Obra precisa de Descarga no Cliente?');
 	var objeto32 = VC.GSC.obterObjetoDoCap('Obra Paletizada?');
	var objeto35 = VC.GSC.obterObjetoDoCap('Logradouro da obra');
 	var objeto36 = VC.GSC.obterObjetoDoCap('Nº Logradouro da obra');
 	var objeto37 = VC.GSC.obterObjetoDoCap('Andar da obra');
 	var objeto38 = VC.GSC.obterObjetoDoCap('Bairro da obra');
 	var objeto39 = VC.GSC.obterObjetoDoCap('CEP da obra');
 	var objeto40 = VC.GSC.obterObjetoDoCap('Complemento da obra');
 	var objeto41 = VC.GSC.obterObjetoDoCap('Cidade da obra');
 	var objeto42 = VC.GSC.obterObjetoDoCap('UF da obra');
 	var objeto43 = VC.GSC.obterObjetoDoCap('Inscrição Estadual');
 	var objeto44 = VC.GSC.obterObjetoDoCap('Código do Representante');
 	var objeto45 = VC.GSC.obterObjetoDoCap('Anexo');

	if (controleDiag.val() == "CNOB") {
		objeto2.row.show();
		objeto3.row.show();
		objeto4.row.show();
		objeto5.row.show();
		objeto6.row.hide();
		objeto7.row.hide();
		objeto8.row.hide();
		objeto9.row.hide();
		objeto10.row.hide();
		objeto11.row.hide();
		objeto12.row.hide();
		objeto13.row.hide();
		objeto14.row.hide();
		objeto15.row.hide();
		objeto16.row.hide();
		objeto17.row.hide();
		objeto20.row.hide();
		objeto22.row.hide();
		objeto30.row.show();
		objeto31.row.show();
		objeto32.row.show();
		objeto35.row.show();
		objeto36.row.show();
		objeto37.row.show();
		objeto38.row.show();
		objeto39.row.show();
		objeto40.row.show();
		objeto41.row.show();
		objeto42.row.show();
		objeto43.row.hide();
		objeto44.row.hide();

  		removeOuAdicionaObrigatoriedade(objeto2.control, true);
  		removeOuAdicionaObrigatoriedade(objeto6.control, false);
  		removeOuAdicionaObrigatoriedade(objeto7.control, false);
  		removeOuAdicionaObrigatoriedade(objeto8.control, false);
  		removeOuAdicionaObrigatoriedade(objeto9.control, false);
  		removeOuAdicionaObrigatoriedade(objeto10.control, false);
  		removeOuAdicionaObrigatoriedade(objeto11.control, false);
  		removeOuAdicionaObrigatoriedade(objeto12.control, false);
  		removeOuAdicionaObrigatoriedade(objeto13.control, false);
  		removeOuAdicionaObrigatoriedade(objeto14.control, false);
  		removeOuAdicionaObrigatoriedade(objeto15.control, false);
  		removeOuAdicionaObrigatoriedade(objeto16.control, false);
  		removeOuAdicionaObrigatoriedade(objeto17.control, false);
  		removeOuAdicionaObrigatoriedade(objeto20.control, false);
  		removeOuAdicionaObrigatoriedade(objeto22.control, false);
 		removeOuAdicionaObrigatoriedade(objeto30.control, true);
 		removeOuAdicionaObrigatoriedade(objeto31.control, true);
 		removeOuAdicionaObrigatoriedade(objeto32.control, true);
 		removeOuAdicionaObrigatoriedade(objeto35.control, true);
 		removeOuAdicionaObrigatoriedade(objeto36.control, true);
 		removeOuAdicionaObrigatoriedade(objeto37.control, true);
 		removeOuAdicionaObrigatoriedade(objeto38.control, true);
 		removeOuAdicionaObrigatoriedade(objeto39.control, true);
 		removeOuAdicionaObrigatoriedade(objeto40.control, true);
 		removeOuAdicionaObrigatoriedade(objeto41.control, true);
 		removeOuAdicionaObrigatoriedade(objeto42.control, true);
 		removeOuAdicionaObrigatoriedade(objeto43.control, false);
 		removeOuAdicionaObrigatoriedade(objeto44.control, false);
 		removeOuAdicionaObrigatoriedade(objeto45.control, true);
	}

	else if (controleDiag.val() == "Pagador") {
		objeto2.row.show();
		objeto3.row.show();
		objeto4.row.show();
		objeto5.row.show();
		objeto6.row.hide();
		objeto7.row.hide();
		objeto8.row.hide();
		objeto9.row.hide();
		objeto10.row.show();
		objeto11.row.show();
		objeto12.row.show();
		objeto13.row.show();
		objeto14.row.show();
		objeto15.row.show();
		objeto16.row.show();
		objeto17.row.show();
		objeto20.row.hide();
		objeto22.row.show();
		objeto30.row.hide();
		objeto31.row.hide();
		objeto32.row.hide();
		objeto35.row.hide();
		objeto36.row.hide();
		objeto37.row.hide();
		objeto38.row.hide();
		objeto39.row.hide();
		objeto40.row.hide();
		objeto41.row.hide();
		objeto42.row.hide();
		objeto43.row.hide();
		objeto44.row.hide();

  		removeOuAdicionaObrigatoriedade(objeto2.control, true);
  		removeOuAdicionaObrigatoriedade(objeto6.control, false);
  		removeOuAdicionaObrigatoriedade(objeto7.control, false);
  		removeOuAdicionaObrigatoriedade(objeto8.control, false);
  		removeOuAdicionaObrigatoriedade(objeto9.control, false);
  		removeOuAdicionaObrigatoriedade(objeto10.control, true);
  		removeOuAdicionaObrigatoriedade(objeto11.control, true);
  		removeOuAdicionaObrigatoriedade(objeto12.control, true);
  		removeOuAdicionaObrigatoriedade(objeto13.control, true);
  		removeOuAdicionaObrigatoriedade(objeto14.control, true);
  		removeOuAdicionaObrigatoriedade(objeto15.control, true);
  		removeOuAdicionaObrigatoriedade(objeto16.control, true);
  		removeOuAdicionaObrigatoriedade(objeto17.control, true);
  		removeOuAdicionaObrigatoriedade(objeto20.control, false);
  		removeOuAdicionaObrigatoriedade(objeto22.control, true);
 		removeOuAdicionaObrigatoriedade(objeto30.control, false);
 		removeOuAdicionaObrigatoriedade(objeto31.control, false);
 		removeOuAdicionaObrigatoriedade(objeto32.control, false);
 		removeOuAdicionaObrigatoriedade(objeto35.control, false);
 		removeOuAdicionaObrigatoriedade(objeto36.control, false);
 		removeOuAdicionaObrigatoriedade(objeto37.control, false);
 		removeOuAdicionaObrigatoriedade(objeto38.control, false);
 		removeOuAdicionaObrigatoriedade(objeto39.control, false);
 		removeOuAdicionaObrigatoriedade(objeto40.control, false);
 		removeOuAdicionaObrigatoriedade(objeto41.control, false);
 		removeOuAdicionaObrigatoriedade(objeto42.control, false);
 		removeOuAdicionaObrigatoriedade(objeto43.control, false);
 		removeOuAdicionaObrigatoriedade(objeto44.control, false);
 		removeOuAdicionaObrigatoriedade(objeto45.control, false);
	}

    	else if (controleDiag.val() == "Cliente CNPJ") {
		objeto2.row.hide();
		objeto3.row.hide();
		objeto4.row.hide();
		objeto5.row.hide();
		objeto6.row.hide();
		objeto7.row.show();
		objeto8.row.hide();
		objeto9.row.show();
		objeto10.row.show();
		objeto11.row.show();
		objeto12.row.show();
		objeto13.row.show();
		objeto14.row.show();
		objeto15.row.show();
		objeto16.row.show();
		objeto17.row.show();
		objeto20.row.hide();
		objeto22.row.hide();
		objeto30.row.hide();
		objeto31.row.hide();
		objeto32.row.hide();
		objeto35.row.hide();
		objeto36.row.hide();
		objeto37.row.hide();
		objeto38.row.hide();
		objeto39.row.hide();
		objeto40.row.hide();
		objeto41.row.hide();
		objeto42.row.hide();
		objeto43.row.show();
		objeto44.row.show();

  		removeOuAdicionaObrigatoriedade(objeto2.control, false);
  		removeOuAdicionaObrigatoriedade(objeto6.control, false);
  		removeOuAdicionaObrigatoriedade(objeto7.control, true);
  		removeOuAdicionaObrigatoriedade(objeto8.control, false);
  		removeOuAdicionaObrigatoriedade(objeto9.control, true);
  		removeOuAdicionaObrigatoriedade(objeto10.control, true);
  		removeOuAdicionaObrigatoriedade(objeto11.control, true);
  		removeOuAdicionaObrigatoriedade(objeto12.control, false);
  		removeOuAdicionaObrigatoriedade(objeto13.control, true);
  		removeOuAdicionaObrigatoriedade(objeto14.control, true);
  		removeOuAdicionaObrigatoriedade(objeto15.control, false);
  		removeOuAdicionaObrigatoriedade(objeto16.control, true);
  		removeOuAdicionaObrigatoriedade(objeto17.control, true);
  		removeOuAdicionaObrigatoriedade(objeto20.control, false);
  		removeOuAdicionaObrigatoriedade(objeto22.control, false);
 		removeOuAdicionaObrigatoriedade(objeto30.control, false);
 		removeOuAdicionaObrigatoriedade(objeto31.control, false);
 		removeOuAdicionaObrigatoriedade(objeto32.control, false);
 		removeOuAdicionaObrigatoriedade(objeto35.control, false);
 		removeOuAdicionaObrigatoriedade(objeto36.control, false);
 		removeOuAdicionaObrigatoriedade(objeto37.control, false);
 		removeOuAdicionaObrigatoriedade(objeto38.control, false);
 		removeOuAdicionaObrigatoriedade(objeto39.control, false);
 		removeOuAdicionaObrigatoriedade(objeto40.control, false);
 		removeOuAdicionaObrigatoriedade(objeto41.control, false);
 		removeOuAdicionaObrigatoriedade(objeto42.control, false);
 		removeOuAdicionaObrigatoriedade(objeto43.control, true);
 		removeOuAdicionaObrigatoriedade(objeto44.control, true);
 		removeOuAdicionaObrigatoriedade(objeto45.control, true);
    		}

    	else if (controleDiag.val() == "Cliente CPF") {
		objeto2.row.hide();
		objeto3.row.hide();
		objeto4.row.hide();
		objeto5.row.hide();
		objeto6.row.hide();
		objeto7.row.hide();
		objeto8.row.show();
		objeto9.row.show();
		objeto10.row.show();
		objeto11.row.show();
		objeto12.row.show();
		objeto13.row.show();
		objeto14.row.show();
		objeto15.row.show();
		objeto16.row.show();
		objeto17.row.show();
		objeto20.row.show();
		objeto22.row.hide();
		objeto30.row.hide();
		objeto31.row.hide();
		objeto32.row.hide();
		objeto35.row.hide();
		objeto36.row.hide();
		objeto37.row.hide();
		objeto38.row.hide();
		objeto39.row.hide();
		objeto40.row.hide();
		objeto41.row.hide();
		objeto42.row.hide();
		objeto43.row.show();
		objeto44.row.show();

  		removeOuAdicionaObrigatoriedade(objeto2.control, false);
  		removeOuAdicionaObrigatoriedade(objeto6.control, false);
  		removeOuAdicionaObrigatoriedade(objeto7.control, false);
  		removeOuAdicionaObrigatoriedade(objeto8.control, true);
  		removeOuAdicionaObrigatoriedade(objeto9.control, true);
  		removeOuAdicionaObrigatoriedade(objeto10.control, true);
  		removeOuAdicionaObrigatoriedade(objeto11.control, true);
  		removeOuAdicionaObrigatoriedade(objeto12.control, false);
  		removeOuAdicionaObrigatoriedade(objeto13.control, true);
  		removeOuAdicionaObrigatoriedade(objeto14.control, true);
  		removeOuAdicionaObrigatoriedade(objeto15.control, false);
  		removeOuAdicionaObrigatoriedade(objeto16.control, true);
  		removeOuAdicionaObrigatoriedade(objeto17.control, true);
  		removeOuAdicionaObrigatoriedade(objeto20.control, true);
  		removeOuAdicionaObrigatoriedade(objeto22.control, false);
 		removeOuAdicionaObrigatoriedade(objeto30.control, false);
 		removeOuAdicionaObrigatoriedade(objeto31.control, false);
 		removeOuAdicionaObrigatoriedade(objeto32.control, false);
 		removeOuAdicionaObrigatoriedade(objeto35.control, false);
 		removeOuAdicionaObrigatoriedade(objeto36.control, false);
 		removeOuAdicionaObrigatoriedade(objeto37.control, false);
 		removeOuAdicionaObrigatoriedade(objeto38.control, false);
 		removeOuAdicionaObrigatoriedade(objeto39.control, false);
 		removeOuAdicionaObrigatoriedade(objeto40.control, false);
 		removeOuAdicionaObrigatoriedade(objeto41.control, false);
 		removeOuAdicionaObrigatoriedade(objeto42.control, false);
 		removeOuAdicionaObrigatoriedade(objeto43.control, true);
 		removeOuAdicionaObrigatoriedade(objeto44.control, true);
 		removeOuAdicionaObrigatoriedade(objeto45.control, true);
    		}
	});
       }
}

function validarVisibilidadeRegras(){
	if(CAPContext.currentWorkflowActionIndex >= 0) {
	var controleDiag = VC.GSC.obterControleDoCap('O que deseja cadastrar?').text().trim();
	var objeto2 = VC.GSC.obterObjetoDoCap('Código Emissor');
 	var objeto3 = VC.GSC.obterObjetoDoCap('Razão Social');
 	var objeto4 = VC.GSC.obterObjetoDoCap('CNPJ');
 	var objeto5 = VC.GSC.obterObjetoDoCap('Regional');
 	var objeto6 = VC.GSC.obterObjetoDoCap('UF - Cliente');
 	var objeto7 = VC.GSC.obterObjetoDoCap('CNPJ Cliente');
 	var objeto8 = VC.GSC.obterObjetoDoCap('CPF');
 	var objeto9 = VC.GSC.obterObjetoDoCap('Razão Social Cliente');
 	var objeto10 = VC.GSC.obterObjetoDoCap('Logradouro');
 	var objeto11 = VC.GSC.obterObjetoDoCap('Nº Logradouro');
 	var objeto12 = VC.GSC.obterObjetoDoCap('Andar');
	var objeto13 = VC.GSC.obterObjetoDoCap('Bairro');
 	var objeto14 = VC.GSC.obterObjetoDoCap('CEP');
 	var objeto15 = VC.GSC.obterObjetoDoCap('Complemento');
 	var objeto16 = VC.GSC.obterObjetoDoCap('Cidade');
 	var objeto17 = VC.GSC.obterObjetoDoCap('UF');
 	var objeto20 = VC.GSC.obterObjetoDoCap('Data de Nascimento do Cliente');
 	var objeto22 = VC.GSC.obterObjetoDoCap('Tipo de Pagador');
 	var objeto30 = VC.GSC.obterObjetoDoCap('Obra precisa de Descarga na Fumaça?');
 	var objeto31 = VC.GSC.obterObjetoDoCap('Obra precisa de Descarga no Cliente?');
 	var objeto32 = VC.GSC.obterObjetoDoCap('Obra Paletizada?');
 	var objeto35 = VC.GSC.obterObjetoDoCap('Logradouro da obra');
 	var objeto36 = VC.GSC.obterObjetoDoCap('Nº Logradouro da obra');
 	var objeto37 = VC.GSC.obterObjetoDoCap('Andar da obra');
 	var objeto38 = VC.GSC.obterObjetoDoCap('Bairro da obra');
 	var objeto39 = VC.GSC.obterObjetoDoCap('CEP da obra');
 	var objeto40 = VC.GSC.obterObjetoDoCap('Complemento da obra');
 	var objeto41 = VC.GSC.obterObjetoDoCap('Cidade da obra');
 	var objeto42 = VC.GSC.obterObjetoDoCap('UF da obra');
 	var objeto43 = VC.GSC.obterObjetoDoCap('Inscrição Estadual');
 	var objeto44 = VC.GSC.obterObjetoDoCap('Código do Representante');

	if (controleDiag == "CNOB") {
		objeto2.row.show();
		objeto3.row.show();
		objeto4.row.show();
		objeto5.row.show();
		objeto6.row.hide();
		objeto7.row.hide();
		objeto8.row.hide();
		objeto9.row.hide();
		objeto10.row.hide();
		objeto11.row.hide();
		objeto12.row.hide();
		objeto13.row.hide();
		objeto14.row.hide();
		objeto15.row.hide();
		objeto16.row.hide();
		objeto17.row.hide();
		objeto20.row.hide();
		objeto22.row.hide();
		objeto30.row.show();
		objeto31.row.show();
		objeto32.row.show();
		objeto35.row.show();
		objeto36.row.show();
		objeto37.row.show();
		objeto38.row.show();
		objeto39.row.show();
		objeto40.row.show();
		objeto41.row.show();
		objeto42.row.show();
		objeto43.row.hide();
		objeto44.row.hide();
	}

	else if (controleDiag == "Pagador") {
		objeto2.row.show();
		objeto3.row.show();
		objeto4.row.show();
		objeto5.row.show();
		objeto6.row.hide();
		objeto7.row.hide();
		objeto8.row.hide();
		objeto9.row.hide();
		objeto10.row.show();
		objeto11.row.show();
		objeto12.row.show();
		objeto13.row.show();
		objeto14.row.show();
		objeto15.row.show();
		objeto16.row.show();
		objeto17.row.show();
		objeto20.row.hide();
		objeto22.row.show();
		objeto30.row.hide();
		objeto31.row.hide();
		objeto32.row.hide();
		objeto35.row.hide();
		objeto36.row.hide();
		objeto37.row.hide();
		objeto38.row.hide();
		objeto39.row.hide();
		objeto40.row.hide();
		objeto41.row.hide();
		objeto42.row.hide();
		objeto43.row.hide();
		objeto44.row.hide();
	}

    	else if (controleDiag == "Cliente CNPJ") {
		objeto2.row.hide();
		objeto3.row.hide();
		objeto4.row.hide();
		objeto5.row.hide();
		objeto6.row.hide();
		objeto7.row.show();
		objeto8.row.hide();
		objeto9.row.show();
		objeto10.row.show();
		objeto11.row.show();
		objeto12.row.show();
		objeto13.row.show();
		objeto14.row.show();
		objeto15.row.show();
		objeto16.row.show();
		objeto17.row.show();
		objeto20.row.show();
		objeto22.row.hide();
		objeto30.row.hide();
		objeto31.row.hide();
		objeto32.row.hide();
		objeto35.row.hide();
		objeto36.row.hide();
		objeto37.row.hide();
		objeto38.row.hide();
		objeto39.row.hide();
		objeto40.row.hide();
		objeto41.row.hide();
		objeto42.row.hide();
		objeto43.row.show();
		objeto44.row.show();
    		}

    	else if (controleDiag == "Cliente CPF") {
		objeto2.row.hide();
		objeto3.row.hide();
		objeto4.row.hide();
		objeto5.row.hide();
		objeto6.row.hide();
		objeto7.row.hide();
		objeto8.row.show();
		objeto9.row.show();
		objeto10.row.show();
		objeto11.row.show();
		objeto12.row.show();
		objeto13.row.show();
		objeto14.row.show();
		objeto15.row.show();
		objeto16.row.show();
		objeto17.row.show();
		objeto20.row.hide();
		objeto22.row.hide();
		objeto30.row.hide();
		objeto31.row.hide();
		objeto32.row.hide();
		objeto35.row.hide();
		objeto36.row.hide();
		objeto37.row.hide();
		objeto38.row.hide();
		objeto39.row.hide();
		objeto40.row.hide();
		objeto41.row.hide();
		objeto42.row.hide();
		objeto43.row.show();
		objeto44.row.show();
    		}
       }
}

function validarVisualizaCSC(){
	if(CAPContext.currentWorkflowActionIndex == 1 || CAPContext.currentWorkflowActionIndex == 3) {
	var controleCadastro = VC.GSC.obterControleDoCap('O que deseja cadastrar?').text().trim();
	var objetoCPF = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o cliente CPF?');
	var objetoCNPJ = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o cliente CNPJ?');
	var objetoObra = VC.GSC.obterObjetoDoCap('Foi possível cadastrar a Obra?');
	var objetoPaga = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o Pagador?');
	var objetoCodObra = VC.GSC.obterObjetoDoCap('Código Obra');
	var objetoCodPaga = VC.GSC.obterObjetoDoCap('Código Pagador');
	var objetoEmissor = VC.GSC.obterObjetoDoCap('Código Emissor criado');
	var objetoVinculo = VC.GSC.obterObjetoDoCap('Foi feito vinculo no código emissor?');
	var objetoNes = VC.GSC.obterObjetoDoCap('É necessário apoio do Fiscal?');

	if (controleCadastro == "CNOB") {
		objetoCPF.row.hide();
		objetoCNPJ.row.hide();
		objetoObra.row.show();
		objetoPaga.row.hide();
		objetoEmissor.row.hide();
		objetoCodObra.row.hide();
		objetoCodPaga.row.hide();
		objetoVinculo.row.hide();
		objetoNes.row.hide();
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, true);
		removeOuAdicionaObrigatoriedade(objetoPaga.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPaga.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoNes.control, false);
	}

    	else if (controleCadastro == "Pagador") {
		objetoCPF.row.hide();
		objetoCNPJ.row.hide();
		objetoObra.row.hide();
		objetoPaga.row.show();
		objetoEmissor.row.hide();
		objetoCodObra.row.hide();
		objetoCodPaga.row.hide();
		objetoVinculo.row.hide();
		objetoNes.row.hide();
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoPaga.control, true);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPaga.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoNes.control, false);
    		}

    	else if (controleCadastro == "Cliente CPF") {
		objetoCPF.row.show();
		objetoCNPJ.row.hide();
		objetoObra.row.hide();
		objetoPaga.row.hide();
		objetoEmissor.row.hide();
		objetoCodObra.row.hide();
		objetoCodPaga.row.hide();
		objetoVinculo.row.hide();
		objetoNes.row.hide();
		removeOuAdicionaObrigatoriedade(objetoCPF.control, true);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoPaga.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPaga.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoNes.control, false);
    		}

    	else if (controleCadastro == "Cliente CNPJ") {
		objetoCPF.row.hide();
		objetoCNPJ.row.show();
		objetoObra.row.hide();
		objetoPaga.row.hide();
		objetoEmissor.row.hide();
		objetoCodObra.row.hide();
		objetoCodPaga.row.hide();
		objetoVinculo.row.hide();
		objetoNes.row.hide();
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, true);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoPaga.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPaga.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoNes.control, false);
    		}

	$('#outcomeRadio_Continue').click(function () {
	var controleCadastro = VC.GSC.obterControleDoCap('O que deseja cadastrar?').text().trim();
	var objetoCPF = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o cliente CPF?');
	var objetoCNPJ = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o cliente CNPJ?');
	var objetoObra = VC.GSC.obterObjetoDoCap('Foi possível cadastrar a Obra?');
	var objetoPaga = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o Pagador?');
	var objetoCodObra = VC.GSC.obterObjetoDoCap('Código Obra');
	var objetoCodPaga = VC.GSC.obterObjetoDoCap('Código Pagador');
	var objetoEmissor = VC.GSC.obterObjetoDoCap('Código Emissor criado');
	var objetoVinculo = VC.GSC.obterObjetoDoCap('Foi feito vinculo no código emissor?');
	var objetoNes = VC.GSC.obterObjetoDoCap('É necessário apoio do Fiscal?');

	if (controleCadastro == "CNOB") {
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, true);
		removeOuAdicionaObrigatoriedade(objetoPaga.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPaga.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoNes.control, false);
	}

    	else if (controleCadastro == "Pagador") {
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoPaga.control, true);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPaga.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoNes.control, false);
    		}

    	else if (controleCadastro == "Cliente CPF") {
		removeOuAdicionaObrigatoriedade(objetoCPF.control, true);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoPaga.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPaga.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoNes.control, false);
    		}

    	else if (controleCadastro == "Cliente CNPJ") {
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, true);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoPaga.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPaga.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoNes.control, false);
    		}
        });
      }
}

function validarRegrasCSC1(){
	if(CAPContext.currentWorkflowActionIndex == 1 || CAPContext.currentWorkflowActionIndex == 3) {
	var controleCPF = VC.GSC.obterControleDoCap('Foi possível cadastrar o cliente CPF?');

	controleCPF.change(function(){
	var controleCPF = VC.GSC.obterControleDoCap('Foi possível cadastrar o cliente CPF?');
	var objetoCNPJ = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o cliente CNPJ?');
	var objetoObra = VC.GSC.obterObjetoDoCap('Foi possível cadastrar a Obra?');
	var objetoPagador = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o Pagador?');
	var objetoCodObra = VC.GSC.obterObjetoDoCap('Código Obra');
	var objetoCodPag = VC.GSC.obterObjetoDoCap('Código Pagador');
	var objetoEmissor = VC.GSC.obterObjetoDoCap('Código Emissor criado');
	var objetoVinculo = VC.GSC.obterObjetoDoCap('Foi feito vinculo no código emissor?');
	var objetoApoio = VC.GSC.obterObjetoDoCap('É necessário apoio do Fiscal?');

	if (controleCPF.val() == "Sim") {
		objetoCNPJ.row.hide();
		objetoObra.row.hide();
		objetoPagador.row.hide();
		objetoCodObra.row.hide();
		objetoCodPag.row.hide();
		objetoEmissor.row.show();
		objetoVinculo.row.hide();
		objetoApoio.row.hide();
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoPagador.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, true);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, false);
	}

    	else if (controleCPF.val() == "Não") {
		objetoCNPJ.row.hide();
		objetoObra.row.hide();
		objetoPagador.row.hide();
		objetoCodObra.row.hide();
		objetoCodPag.row.hide();
		objetoEmissor.row.hide();
		objetoVinculo.row.hide();
		objetoApoio.row.show();
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoPagador.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, true);
    		}

    	else {
		objetoCNPJ.row.hide();
		objetoObra.row.hide();
		objetoPagador.row.hide();
		objetoCodObra.row.hide();
		objetoCodPag.row.hide();
		objetoEmissor.row.hide();
		objetoVinculo.row.hide();
		objetoApoio.row.hide();
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoPagador.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, false);
    		}
	});
        
	$('#outcomeRadio_Continue').click(function () {
	var controleCPF = VC.GSC.obterControleDoCap('Foi possível cadastrar o cliente CPF?');
	var objetoCNPJ = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o cliente CNPJ?');
	var objetoObra = VC.GSC.obterObjetoDoCap('Foi possível cadastrar a Obra?');
	var objetoPagador = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o Pagador?');
	var objetoCodObra = VC.GSC.obterObjetoDoCap('Código Obra');
	var objetoCodPag = VC.GSC.obterObjetoDoCap('Código Pagador');
	var objetoEmissor = VC.GSC.obterObjetoDoCap('Código Emissor criado');
	var objetoVinculo = VC.GSC.obterObjetoDoCap('Foi feito vinculo no código emissor?');
	var objetoApoio = VC.GSC.obterObjetoDoCap('É necessário apoio do Fiscal?');

	if (controleCPF.val() == "Sim") {
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoPagador.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, true);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, false);
	}

    	else if (controleCPF.val() == "Não") {
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoPagador.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, true);
    		}

    	else {
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoPagador.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, false);
    		}
        	});
       }
}

function validarRegrasCSC2(){
	if(CAPContext.currentWorkflowActionIndex == 1 || CAPContext.currentWorkflowActionIndex == 3) {
	var controleCNPJ = VC.GSC.obterControleDoCap('Foi possível cadastrar o cliente CNPJ?');

	controleCNPJ.change(function(){
	var controleCNPJ = VC.GSC.obterControleDoCap('Foi possível cadastrar o cliente CNPJ?');
	var objetoCPF = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o cliente CPF?');
	var objetoObra = VC.GSC.obterObjetoDoCap('Foi possível cadastrar a Obra?');
	var objetoPagador = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o Pagador?');
	var objetoCodObra = VC.GSC.obterObjetoDoCap('Código Obra');
	var objetoCodPag = VC.GSC.obterObjetoDoCap('Código Pagador');
	var objetoEmissor = VC.GSC.obterObjetoDoCap('Código Emissor criado');
	var objetoVinculo = VC.GSC.obterObjetoDoCap('Foi feito vinculo no código emissor?');
	var objetoApoio = VC.GSC.obterObjetoDoCap('É necessário apoio do Fiscal?');

	if (controleCNPJ.val() == "Sim") {
		objetoCPF.row.hide();
		objetoObra.row.hide();
		objetoPagador.row.hide();
		objetoCodObra.row.hide();
		objetoCodPag.row.hide();
		objetoEmissor.row.show();
		objetoVinculo.row.hide();
		objetoApoio.row.hide();
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoPagador.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, true);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, false);
	}

    	else if (controleCNPJ.val() == "Não") {
		objetoCPF.row.hide();
		objetoObra.row.hide();
		objetoPagador.row.hide();
		objetoCodObra.row.hide();
		objetoCodPag.row.hide();
		objetoEmissor.row.hide();
		objetoVinculo.row.hide();
		objetoApoio.row.show();
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoPagador.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, true);
    		}

    	else {
		objetoCPF.row.hide();
		objetoObra.row.hide();
		objetoPagador.row.hide();
		objetoCodObra.row.hide();
		objetoCodPag.row.hide();
		objetoEmissor.row.hide();
		objetoVinculo.row.hide();
		objetoApoio.row.hide();
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoPagador.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, false);
    		}
	});
        
	$('#outcomeRadio_Continue').click(function () {
	var controleCNPJ = VC.GSC.obterControleDoCap('Foi possível cadastrar o cliente CNPJ?');
	var objetoCPF = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o cliente CPF?');
	var objetoObra = VC.GSC.obterObjetoDoCap('Foi possível cadastrar a Obra?');
	var objetoPagador = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o Pagador?');
	var objetoCodObra = VC.GSC.obterObjetoDoCap('Código Obra');
	var objetoCodPag = VC.GSC.obterObjetoDoCap('Código Pagador');
	var objetoEmissor = VC.GSC.obterObjetoDoCap('Código Emissor criado');
	var objetoVinculo = VC.GSC.obterObjetoDoCap('Foi feito vinculo no código emissor?');
	var objetoApoio = VC.GSC.obterObjetoDoCap('É necessário apoio do Fiscal?');

	if (controleCNPJ.val() == "Sim") {
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoPagador.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, true);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, false);
	}

    	else if (controleCNPJ.val() == "Não") {
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoPagador.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, true);
    		}

    	else {
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoPagador.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, false);
    		}
        	});
       }
}

function validarRegrasCSC3(){
	if(CAPContext.currentWorkflowActionIndex == 1 || CAPContext.currentWorkflowActionIndex == 3) {
	var controleObra = VC.GSC.obterControleDoCap('Foi possível cadastrar a Obra?');

	controleObra.change(function(){
	var controleObra = VC.GSC.obterControleDoCap('Foi possível cadastrar a Obra?');
	var objetoCPF = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o cliente CPF?');
	var objetoCNPJ = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o cliente CNPJ?');
	var objetoPagador = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o Pagador?');
	var objetoCodObra = VC.GSC.obterObjetoDoCap('Código Obra');
	var objetoCodPag = VC.GSC.obterObjetoDoCap('Código Pagador');
	var objetoEmissor = VC.GSC.obterObjetoDoCap('Código Emissor criado');
	var objetoVinculo = VC.GSC.obterObjetoDoCap('Foi feito vinculo no código emissor?');
	var objetoApoio = VC.GSC.obterObjetoDoCap('É necessário apoio do Fiscal?');

	if (controleObra.val() == "Sim") {
		objetoCPF.row.hide();
		objetoCNPJ.row.hide();
		objetoPagador.row.hide();
		objetoCodObra.row.show();
		objetoCodPag.row.hide();
		objetoEmissor.row.hide();
		objetoVinculo.row.show();
		objetoApoio.row.hide();
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoPagador.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, true);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, true);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, false);
	}

    	else if (controleObra.val() == "Não") {
		objetoCPF.row.hide();
		objetoCNPJ.row.hide();
		objetoPagador.row.hide();
		objetoCodObra.row.hide();
		objetoCodPag.row.hide();
		objetoEmissor.row.hide();
		objetoVinculo.row.hide();
		objetoApoio.row.show();
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoPagador.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, true);
    		}

    	else {
		objetoCPF.row.hide();
		objetoCNPJ.row.hide();
		objetoPagador.row.hide();
		objetoCodObra.row.hide();
		objetoCodPag.row.hide();
		objetoEmissor.row.hide();
		objetoVinculo.row.hide();
		objetoApoio.row.hide();
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoPagador.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, false);
    		}
	});
        
	$('#outcomeRadio_Continue').click(function () {
	var controleObra = VC.GSC.obterControleDoCap('Foi possível cadastrar a Obra?');
	var objetoCPF = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o cliente CPF?');
	var objetoCNPJ = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o cliente CNPJ?');
	var objetoPagador = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o Pagador?');
	var objetoCodObra = VC.GSC.obterObjetoDoCap('Código Obra');
	var objetoCodPag = VC.GSC.obterObjetoDoCap('Código Pagador');
	var objetoEmissor = VC.GSC.obterObjetoDoCap('Código Emissor criado');
	var objetoVinculo = VC.GSC.obterObjetoDoCap('Foi feito vinculo no código emissor?');
	var objetoApoio = VC.GSC.obterObjetoDoCap('É necessário apoio do Fiscal?');

	if (controleObra.val() == "Sim") {
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoPagador.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, true);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, true);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, false);
	}

    	else if (controleObra.val() == "Não") {
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoPagador.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, true);
    		}

    	else {
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoPagador.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, false);
    		}
        	});
       }
}

function validarRegrasCSC4(){
	if(CAPContext.currentWorkflowActionIndex == 1 || CAPContext.currentWorkflowActionIndex == 3) {
	var controlePaga = VC.GSC.obterControleDoCap('Foi possível cadastrar o Pagador?');

	controlePaga.change(function(){
	var controlePaga = VC.GSC.obterControleDoCap('Foi possível cadastrar o Pagador?');
	var objetoCPF = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o cliente CPF?');
	var objetoCNPJ = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o cliente CNPJ?');
	var objetoObra = VC.GSC.obterObjetoDoCap('Foi possível cadastrar a Obra?');
	var objetoCodObra = VC.GSC.obterObjetoDoCap('Código Obra');
	var objetoCodPag = VC.GSC.obterObjetoDoCap('Código Pagador');
	var objetoEmissor = VC.GSC.obterObjetoDoCap('Código Emissor criado');
	var objetoVinculo = VC.GSC.obterObjetoDoCap('Foi feito vinculo no código emissor?');
	var objetoApoio = VC.GSC.obterObjetoDoCap('É necessário apoio do Fiscal?');

	if (controlePaga.val() == "Sim") {
		objetoCPF.row.hide();
		objetoCNPJ.row.hide();
		objetoObra.row.hide();
		objetoCodObra.row.hide();
		objetoCodPag.row.show();
		objetoEmissor.row.hide();
		objetoVinculo.row.show();
		objetoApoio.row.hide();
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, true);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, true);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, false);
	}

    	else if (controlePaga.val() == "Não") {
		objetoCPF.row.hide();
		objetoCNPJ.row.hide();
		objetoObra.row.hide();
		objetoCodObra.row.hide();
		objetoCodPag.row.hide();
		objetoEmissor.row.hide();
		objetoVinculo.row.hide();
		objetoApoio.row.show();
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, true);
    		}

    	else {
		objetoCPF.row.hide();
		objetoCNPJ.row.hide();
		objetoObra.row.hide();
		objetoCodObra.row.hide();
		objetoCodPag.row.hide();
		objetoEmissor.row.hide();
		objetoVinculo.row.hide();
		objetoApoio.row.hide();
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, false);
    		}
	});
        
	$('#outcomeRadio_Continue').click(function () {
	var controlePaga = VC.GSC.obterControleDoCap('Foi possível cadastrar o Pagador?');
	var objetoCPF = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o cliente CPF?');
	var objetoCNPJ = VC.GSC.obterObjetoDoCap('Foi possível cadastrar o cliente CNPJ?');
	var objetoObra = VC.GSC.obterObjetoDoCap('Foi possível cadastrar a Obra?');
	var objetoCodObra = VC.GSC.obterObjetoDoCap('Código Obra');
	var objetoCodPag = VC.GSC.obterObjetoDoCap('Código Pagador');
	var objetoEmissor = VC.GSC.obterObjetoDoCap('Código Emissor criado');
	var objetoVinculo = VC.GSC.obterObjetoDoCap('Foi feito vinculo no código emissor?');
	var objetoApoio = VC.GSC.obterObjetoDoCap('É necessário apoio do Fiscal?');

	if (controlePaga.val() == "Sim") {
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, true);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, true);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, false);
	}

    	else if (controlePaga.val() == "Não") {
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, true);
    		}

    	else {
		removeOuAdicionaObrigatoriedade(objetoCPF.control, false);
		removeOuAdicionaObrigatoriedade(objetoCNPJ.control, false);
		removeOuAdicionaObrigatoriedade(objetoObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodObra.control, false);
		removeOuAdicionaObrigatoriedade(objetoCodPag.control, false);
		removeOuAdicionaObrigatoriedade(objetoEmissor.control, false);
		removeOuAdicionaObrigatoriedade(objetoVinculo.control, false);
		removeOuAdicionaObrigatoriedade(objetoApoio.control, false);
    		}
        	});
       }
}


function zeraValores(){
              if (CAPContext.currentWorkflowActionIndex == 3) {
             	var controlecaus1 = VC.GSC.obterControleDoCap('Foi possível cadastrar o cliente CPF?');
             	var controlecaus2 = VC.GSC.obterControleDoCap('Foi possível cadastrar o cliente CNPJ?');
             	var controlecaus3 = VC.GSC.obterControleDoCap('Foi possível cadastrar a Obra?');
             	var controlecaus4 = VC.GSC.obterControleDoCap('Foi possível cadastrar o Pagador?');

              controlecaus1.val("__SELECT__");
              controlecaus2.val("__SELECT__");
              controlecaus3.val("__SELECT__");
              controlecaus4.val("__SELECT__");
                }
  }

function validarMascaraFone(){
	if(CAPContext.currentWorkflowActionIndex == -1) {
        VC.GSC.configurarMascaraFone('VC');
       }
}

function validarFone(){
	if(CAPContext.currentWorkflowActionIndex == -1 && VC.GSC.existeCampo('Telefone SMS Cliente') && VC.GSC.existeCampo('Telefone Fixo Cliente')) {
	var controleRemessa = VC.GSC.obterControleDoCap('Telefone SMS Cliente');
        VC.GSC.configurarMascaraFone('VC');

	controleRemessa.change(function(){
	var controleRemessa = VC.GSC.obterControleDoCap('Telefone SMS Cliente');
	var objetoNumreme = VC.GSC.obterObjetoDoCap('Telefone Fixo Cliente');

	if (controleRemessa.val() == "") {
		removeOuAdicionaObrigatoriedade(objetoNumreme.control, true);
	}
    	else {
		removeOuAdicionaObrigatoriedade(objetoNumreme.control, false);
    		}
	});
        
	$('#outcomeRadio_Continue').click(function () {
	var controleRemessa = VC.GSC.obterControleDoCap('Telefone SMS Cliente');
	var objetoNumreme = VC.GSC.obterObjetoDoCap('Telefone Fixo Cliente');

	removeOuAdicionaObrigatoriedade(objetoNumreme.control, false);

        	});
       }
}


function validarAvisoAvaria(){
	if(CAPContext.currentWorkflowActionIndex == -1) {
	var controleNegocio = VC.GSC.obterControleDoCap('Negócio');

	controleNegocio.change(function(){
	var controleNegocio = VC.GSC.obterControleDoCap('Negócio');

	if (controleNegocio.val() == "Avaria") {
                alert("Caso deseje cadastrar o cliente para avaria, é obrigatório o envio em anexo do 'de acordo' de seu coordenador de vendas.");
	}
	});
       }
}

function validarViter(){
	if(CAPContext.currentWorkflowActionIndex == 0) {
	var controleDiag = VC.GSC.obterControleDoCap('Ação Cadastro');
	var objetoRegional = VC.GSC.obterObjetoDoCap('Código do cliente criado');
	var objetoMotivo = VC.GSC.obterObjetoDoCap('Motivo da devolução');
	var objetoCausa = VC.GSC.obterObjetoDoCap('Causa Raiz');
	var objeto1 = VC.GSC.obterObjetoDoCap('Frente OTC');
	var objeto2 = VC.GSC.obterObjetoDoCap('Ação');
	var objeto3 = VC.GSC.obterObjetoDoCap('Erro ou Rotina');
	objetoRegional.row.hide();
	objetoMotivo.row.hide();
        objetoCausa.row.hide();
        objeto1.row.hide();
        objeto2.row.hide();
        objeto3.row.hide();

	controleDiag.change(function(){
	var controleDiag = VC.GSC.obterControleDoCap('Ação Cadastro');
	var objetoRegional = VC.GSC.obterObjetoDoCap('Código do cliente criado');
	var objetoMotivo = VC.GSC.obterObjetoDoCap('Motivo da devolução');
	var objetoCausa = VC.GSC.obterObjetoDoCap('Causa Raiz');
	var objeto1 = VC.GSC.obterObjetoDoCap('Frente OTC');
	var objeto2 = VC.GSC.obterObjetoDoCap('Ação');
	var objeto3 = VC.GSC.obterObjetoDoCap('Erro ou Rotina');

	if (controleDiag.val() == "Cliente cadastrado pela 297") {
		objetoRegional.row.show();
		objetoMotivo.row.hide();
                objetoCausa.row.hide();
                objeto1.row.hide();
                objeto2.row.hide();
                objeto3.row.hide();
		removeOuAdicionaObrigatoriedade(objetoRegional.control, true);
		removeOuAdicionaObrigatoriedade(objetoMotivo.control, false);
		removeOuAdicionaObrigatoriedade(objetoCausa.control, false);
	}

    	else if (controleDiag.val() == "Acionar CSC cadastro") {
		objetoRegional.row.hide();
		objetoMotivo.row.hide();
                objetoCausa.row.show();
                objeto1.row.show();
                objeto2.row.show();
                objeto3.row.show();
		removeOuAdicionaObrigatoriedade(objetoRegional.control, false);
		removeOuAdicionaObrigatoriedade(objetoMotivo.control, false);
		removeOuAdicionaObrigatoriedade(objetoCausa.control, true);
    		}

    	else if (controleDiag.val() == "Dados incompletos") {
		objetoRegional.row.hide();
		objetoMotivo.row.show();
                objetoCausa.row.hide();
                objeto1.row.hide();
                objeto2.row.hide();
                objeto3.row.hide();
		removeOuAdicionaObrigatoriedade(objetoRegional.control, false);
		removeOuAdicionaObrigatoriedade(objetoMotivo.control, true);
		removeOuAdicionaObrigatoriedade(objetoCausa.control, false);
    		}
	});
        
	$('#outcomeRadio_Continue').click(function () {
	var controleDiag = VC.GSC.obterControleDoCap('Ação Cadastro');
	var objetoRegional = VC.GSC.obterObjetoDoCap('Código do cliente criado');
	var objetoMotivo = VC.GSC.obterObjetoDoCap('Motivo da devolução');
	var objetoCausa = VC.GSC.obterObjetoDoCap('Causa Raiz');
	var objeto1 = VC.GSC.obterObjetoDoCap('Frente OTC');
	var objeto2 = VC.GSC.obterObjetoDoCap('Ação');
	var objeto3 = VC.GSC.obterObjetoDoCap('Erro ou Rotina');

	if (controleDiag.val() == "Cliente cadastrado pela 297") {
		objetoRegional.row.show();
		objetoMotivo.row.hide();
                objetoCausa.row.hide();
                objeto1.row.hide();
                objeto2.row.hide();
                objeto3.row.hide();
		removeOuAdicionaObrigatoriedade(objetoRegional.control, true);
		removeOuAdicionaObrigatoriedade(objetoMotivo.control, false);
		removeOuAdicionaObrigatoriedade(objetoCausa.control, false);
	}

    	else if (controleDiag.val() == "Acionar CSC cadastro") {
		objetoRegional.row.hide();
		objetoMotivo.row.hide();
                objetoCausa.row.show();
                objeto1.row.show();
                objeto2.row.show();
                objeto3.row.show();
		removeOuAdicionaObrigatoriedade(objetoRegional.control, false);
		removeOuAdicionaObrigatoriedade(objetoMotivo.control, false);
		removeOuAdicionaObrigatoriedade(objetoCausa.control, true);
    		}

    	else if (controleDiag.val() == "Dados incompletos") {
		objetoRegional.row.hide();
		objetoMotivo.row.show();
                objetoCausa.row.hide();
                objeto1.row.hide();
                objeto2.row.hide();
                objeto3.row.hide();
		removeOuAdicionaObrigatoriedade(objetoRegional.control, false);
		removeOuAdicionaObrigatoriedade(objetoMotivo.control, true);
		removeOuAdicionaObrigatoriedade(objetoCausa.control, false);
    		}
        	});
       }
}

/**
 *  “Ação Cadastro” for preenchido com a opção “Acionar CSC cadastro”. 
 *   1. Negócio: 
 *   2. Trilha 
 *   3. Matrícula vendedor: 
 *   4. Matrícula coordenador: 
 *   5. Grupo de Vendedores:  
 *   6. Escritório de Vendas: 
 *   7. Descarga na Fumaça?: 
 *   8. Descarga no Cliente?: 
 *   9. Paletizado?: 
 *   10. Grupo de Segmento: 
 *   11. Segmento:
 */

function visible(atributo,status,requerido){

    // Desabilitar 
    if(status =="D"){
        CAPContext.attributes[atributo].row.hide();
        CAPContext.attributes[atributo].control.closest('td').find('div span[id$=Validator]').prop('enabled', false);
        CAPContext.attributes[atributo].control.closest('tr').find('span[title=Requerido]').hide();

    // Habilitar    
    }else if(status =="H"){
        CAPContext.attributes[atributo].row.show();
        if(requerido==true){
            CAPContext.attributes[atributo].control.closest('td').find('div span[id$=Validator]').prop('enabled', true);
            CAPContext.attributes[atributo].control.closest('tr').find('span[title=Requerido]').show();
        }    
    }
}
function valor_control(valor){
   if (valor != ""){
        return CAPContext.attributes[valor].val();
   }
 }

// Suporte 1713036


$(document).ready(function acaoCadastro(){

    if (CAPContext.currentWorkflowActionIndex == -1){
        let lista_Atributos = ["negocio",
                            "trilha",
                            "matriculaVendedor",
                            "matriculaCoordenador",
                            "grupoDeVendedores",
                            "escritorioDeVendas",
                            "descargaNaFumaca",
                            "descargaNoCliente",
                            "paletizado",
                            "grupoDeSegmento",
                            "segmento"]

        // Desabilita os atributos da lista
        lista_Atributos.forEach(function (x){
            visible(x,"D",false);
        });

        CAPContext.attributes.acaoCadastro.change( function (){
            if(valor_control("acaoCadastro")=="Acionar CSC cadastro"){
                // Habilita os atributos da lista
                lista_Atributos.forEach(function (x){
                    visible(x,"H",false);
                });
  
            }else{
                // Desabilitar os atributos da lista
                lista_Atributos.forEach(function (x){
                    visible(x,"D",false);
                });
                
            }
        });
    
    }

});




function configurar() {
    VC.GSC.Configuracao.CamposDeCPF = [
               "CPF"
    ];

    VC.GSC.Configuracao.CamposDeCNPJ = [
               "CNPJ Cliente"
    ];
	
	VC.GSC.Configuracao.CamposDeEmail = [
                "E-mail do cliente",
                "E-mail para retorno"
	];
	
	VC.GSC.Configuracao.CamposDeTelefone = [
                "Telefone do cliente",
                "Celular do cliente"
	];
	
	VC.GSC.Configuracao.CamposDeNotaFiscal = [
	];
	
	VC.GSC.Configuracao.CamposDeDinheiro = [
	];
	
        validarRegras();
        validarVisibilidadeRegras();
        validarMascaraFone();
	definirLayoutSLA();
	configurarSeparadores();
	validarAnexos();
        validarDiagnostico();
        validarVisualizaCSC();

        validarRegrasCSC1();
        validarRegrasCSC2();
        validarRegrasCSC3();
        validarRegrasCSC4();
        zeraValores();
        validarFone();
        validarAvisoAvaria();
        validarViter();
    VC.GSC.init();
}

ExecuteOrDelayUntilScriptLoaded(configurar, "sp.js"); 