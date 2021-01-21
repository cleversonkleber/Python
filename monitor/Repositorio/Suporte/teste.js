/************************************************************/
/* Nome do Fluxo: Resolver Supeita de Fraude                */
/* Data da Atualização: 05/08 - ASA                         */
/* Data da Atualização: 15/08 - DSH                         */
/* Data da Atualização: 19/08 - DSH                         */
/* Data da Atualização: 21/08 - LTA                         */
/* Data da Atualização: 24/08 - LTA                         */
/* Data da Atualização: 30/08 - ASA                         */
/* Data da Atualização: 31/08 - ASA                         */
/************************************************************/

var VC = VC || {};
(VC.GSC = {
    Configuracao: {
        CamposDeTelefone: [],
        CamposDeEMail: [],
        CamposDeCNPJ: [],
        CamposDeNotaFiscal: [],
        UsuarioCorrente: "",
        siteUrl: _spPageContextInfo.webAbsoluteUrl,
        TitulosDasAbas: [],
        CamposLimitadores: [],
        OcultarLinhas: [],
		CamposDeDinheiro: []
    },

    init: function () {
        var subObjetos = VC.GSC.obterChaves(VC.GSC);
        $.each(subObjetos, function (i, v) {
            if (VC.GSC[v].hasOwnProperty("init")) {
                VC.GSC[v].init();
            }
        });

        // Configura a máscara dos campos do tipo telefone
        VC.GSC.configurarMascaraTelefone();
        VC.GSC.configurarMascaraCNPJ();
        VC.GSC.obterUsuarioCorrente();
        VC.GSC.configurarMascaraDinheiro();
        VC.GSC.configurarMascaraNotaFiscal();
        VC.GSC.validarEmailParaOUsuario();
        VC.GSC.ocultar();

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
							for(var i=0;i<11 - tamanhoNotaFiscal;i++){
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
                if (value.name == displayValue) {
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
                if (value.name == displayValue) {
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
        if (CAPContext.currentWorkflowActionIndex == -1 && VC.GSC.existeCampo("Vendedor")) {
            var objCampoVendedor = VC.GSC.obterObjetoDoCap("Vendedor");
            objCampoVendedor.row.select().find("[id$=editorDiv]").text(VC.GSC.Configuracao.UsuarioCorrente);
            objCampoVendedor.row.select().find("[id$=checkNamesImage1]").click();
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
                if (!CAPContext.attributes[item[0]].row.is(":visible")) {
                    CAPContext.attributes[item[0]].row.show();
                }

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

    obterChaves: function (objeto) {
        var chaves = [];
        for (k in objeto) chaves.push(k);
        return chaves;
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

    adicionarSeparador: function (nomeDoCampo, titulo) {
        if (VC.GSC.existeCampo(nomeDoCampo)) {
            VC.GSC.obterObjetoDoCap(nomeDoCampo).row.before("<tr><td colspan=2 style='border-bottom: 1px solid #d8d8d8; font-weight: bold; line-height: 25px; padding-top: 10px;'>" + titulo + "</td></tr>");
        }
        else {
            console.log("Não existe o campo:" + nomeDoCampo);
        }
    },
    
	configurarMascaraNotaFiscal: function(tipoDeArea){
		$.each(VC.GSC.Configuracao.CamposDeNotaFiscal, function(i, nomeDoAtributo){
			if(VC.GSC.existeCampo(nomeDoAtributo)){
				var maskVC = "000000000";
				var maskEGX = "000000";
				var obj = VC.GSC.obterObjetoDoCap(nomeDoAtributo);
				if(obj.control.is('input')){
					obj.control.val('');
				}
				if(tipoDeArea == "VC"){
					if (obj.control.is('input')) {
                        obj.control.unbind("focusout");
						obj.control.mask(maskVC);
					}
					obj.control.focusout(function(){
						var tamanhoNotaFiscal = obj.control.val().length;
						if(obj.control.val().length < 9){
							for(var i=0;i<9 - tamanhoNotaFiscal;i++){
								obj.control.val("0" + obj.control.val());
							}
						}
					});
				}
				
				else if(tipoDeArea == "EGX"){
					if (obj.control.is('input')) {
                        obj.control.unbind("focusout");                        
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
						obj.control.unbind("focusout");
						obj.control.unmask();
					}
				}
			}
		});
	},
    
	validarEmail: function (valorCampoEmail) {
        var emails = valorCampoEmail.replace(" ", "").split(";");
        var valido = true;
		var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

        $.each(emails, function(i, email){
            if(email != "" && !regex.test(email)){
                valido = false;
            }
        });
		return valido;
	},

    validarEmailParaOUsuario: function () {
        if (typeof CAPContext != "undefined") {
            $.each(VC.GSC.Configuracao.CamposDeEmail, function (i, nomeDoAtributo) {
                if (VC.GSC.existeCampo(nomeDoAtributo)) {
                    var objetoEmail = VC.GSC.obterObjetoDoCap(nomeDoAtributo);
                    var campoEmailPossuiValorInvalido = false;
                    if (objetoEmail.control.is('input') || objetoEmail.control.is('textarea')) {
                        if (objetoEmail.control.is('textarea')) {
                            objetoEmail.control.closest('td').append(
								"<label style='color: Blue; font-weight: bold;'>Favor inserir cada um dos valores de e-mail procedidos imediatamente de \";\".</label>"
							);
                        }
                        var valoresInvalidos = [];
                        objetoEmail.control.focusout(function () {
                            campoEmailPossuiValorInvalido = false;
                            if (objetoEmail.control.is('textarea')) {
                                var valoresDeEmail = objetoEmail.control.val().split(';');
                                $.each(valoresDeEmail, function (i, valorInvestigado) {
                                    valorInvestigado = valorInvestigado.trim();
                                    if (!VC.GSC.validarEmail(valorInvestigado) && valorInvestigado != "") {
                                        valoresInvalidos.push(valorInvestigado);
                                        campoEmailPossuiValorInvalido = true;
                                    }
                                });
                            }
                            else if (objetoEmail.control.is('input')) {
                                if (!VC.GSC.validarEmail(objetoEmail.control.val()) && objetoEmail.control.val() != "") {
                                    alert('O campo ' + objetoEmail.name + ' não possuí um valor válido de e-mail.');
                                    campoEmailPossuiValorInvalido = true;
                                }
                            }

                            if (objetoEmail.control.is('textarea') && valoresInvalidos.length != 0) {
                                var textoDeValoresInvalidos = "";
                                $.each(valoresInvalidos, function (i, valor) {
                                    textoDeValoresInvalidos += valor + ";";
                                });
                                alert('Erro de Preenchimento! Os seguintes valores são e-mails inválidos:\n' +
									textoDeValoresInvalidos
								);
                                valoresInvalidos = [];
                            }
                        });

                        if ($('[id$=sendRequest]').length > 0) {
                            $('[id$=sendRequest]').click(function (e) {
                                var objetoEmail = VC.GSC.obterObjetoDoCap(nomeDoAtributo);
                                if (objetoEmail.displayMode == "Required" && campoEmailPossuiValorInvalido) {
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
        RelacaoEstadoRegional: {'PR':'Sul', 'RS':'Sul', 'SC':'Sul', 'ES':'Sudeste', 'MG':'Sudeste', 'RJ':'Sudeste', 'SP':'Sudeste',
            'AC':'Centro Norte', 'AM':'Centro Norte', 'AP':'Centro Norte', 'DF':'Centro Norte', 'GO':'Centro Norte', 'MS':'Centro Norte',
            'MT':'Centro Norte', 'PA':'Centro Norte', 'RO':'Centro Norte', 'RR':'Centro Norte', 'TO':'Centro Norte', 'AL':'Nordeste',
            'BA':'Nordeste', 'CE':'Nordeste', 'MA':'Nordeste', 'PB':'Nordeste', 'PE':'Nordeste', 'PI':'Nordeste', 'RN':'Nordeste',
            'SE':'Nordeste' }
    },

    init: function () {
        VC.GSC.Cliente.configurarCliente();
    },

    obterSOAPMessage: function(codigoEmissor){
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
    
    buscaClienteOnSuccess: function(data, status){
        try {
            var strResultado = $(data).find('GetClientDataResult').text().toString();
            var configuracao = VC.GSC.Cliente.Configuracao;
            objResultado = $.parseJSON(strResultado);
            if (parseInt(objResultado.STATUS) == 0){

				ctlRazao = VC.GSC.obterControleDoCap(VC.GSC.Cliente.Configuracao.CampoRazao);
				ctlEstado = VC.GSC.obterControleDoCap(VC.GSC.Cliente.Configuracao.CampoEstado);
				ctlCNPJ = VC.GSC.obterControleDoCap(VC.GSC.Cliente.Configuracao.CampoCNPJ);
				ctlRegional = VC.GSC.obterControleDoCap(VC.GSC.Cliente.Configuracao.CampoRegional);
				
				ctlRazao = VC.GSC.obterControleDoCap(configuracao.CampoRazao);
                valor = objResultado.NAME1 == null ? "" : objResultado.NAME1 ;
                ctlRazao.val(valor);
                VC.GSC.Cliente.alteraVisualizacaoCampo(ctlRazao, valor);
                
                ctlCNPJ = VC.GSC.obterControleDoCap(configuracao.CampoCNPJ);
                valor = objResultado.STCD1 == null ? "" : VC.GSC.formatarDocumento(objResultado.STCD1);
                ctlCNPJ.val(valor);
                VC.GSC.Cliente.alteraVisualizacaoCampo(ctlCNPJ, valor);

                ctlUF =  VC.GSC.obterControleDoCap(configuracao.CampoEstado);
                valor = objResultado.UF == null ? "" : objResultado.UF;
                ctlUF.val(valor);
                VC.GSC.Cliente.alteraVisualizacaoCampo(ctlUF, valor);
                
				if(valor != ""){
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
        catch(e){
            console.log('erro:' + e.message);
			VC.GSC.unblockUserInterface();
        }
		VC.GSC.unblockUserInterface();
    },
    
    buscaClienteOnError: function(request, status, error){
        console.log('Erro na chamada do serviço do cliente');
		VC.GSC.unblockUserInterface();
    },
    
    configurarCliente: function(){
        if(VC.GSC.existeCampo(this.Configuracao.CampoCNPJ) && VC.GSC.existeCampo(this.Configuracao.CampoRegional) && 
           VC.GSC.existeCampo(this.Configuracao.CampoEstado) && VC.GSC.existeCampo(this.Configuracao.CampoRazao)&& 
           VC.GSC.existeCampo(this.Configuracao.CampoCodigoEmissor)){
            ctlEmissor = VC.GSC.obterControleDoCap(this.Configuracao.CampoCodigoEmissor);
            ctlRazao = VC.GSC.obterControleDoCap(this.Configuracao.CampoRazao);
            ctlEstado = VC.GSC.obterControleDoCap(this.Configuracao.CampoEstado);
            ctlCNPJ = VC.GSC.obterControleDoCap(this.Configuracao.CampoCNPJ);
            ctlRegional = VC.GSC.obterControleDoCap(this.Configuracao.CampoRegional);
            if(!ctlEmissor.is('input') || !ctlRazao.is('input') || !ctlEstado.is('input') || !ctlCNPJ.is('input') && !ctlRegional.is('input')){
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

            
            ctlEmissor.focusout(function(e){
				try{
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

					if(valorSelecionado != ""){
				VC.GSC.blockUserInterface();
						var uri = _spPageContextInfo.webAbsoluteUrl + "/_vti_bin/iteris/ExtensionsCAP/SAPWebService.asmx";
						var soapAction = "http://tempuri.org/GetClientData";
						$.ajax({
							url: uri ,
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
				catch(e){
					VC.GSC.unblockUserInterface();
				}
            });
            
        }
    }
}

VC.GSC.ClienteVIP = VC.GSC.ClienteVIP || {
    Configuracao: {
        CampoClienteVIP: "Cliente VIP",
        CodigoClienteSAP: "Código Emissor",
        collListItem: null
    },

    init: function () {
        // Configura o cliente vip se for selecionado um serviço ou se está no detalhe de uma solicitação
        if (typeof CAPContext != "undefined") {
            if (VC.GSC.existeCampo(this.Configuracao.CodigoClienteSAP) && VC.GSC.existeCampo(this.Configuracao.CampoClienteVIP)) {
                this.configurarClienteVIP();
            }
        }
    },

    configurarClienteVIP: function () {
        var controleCodigoClienteSAP = VC.GSC.obterControleDoCap(this.Configuracao.CodigoClienteSAP);
        var controleClienteVIP = VC.GSC.obterControleDoCap(this.Configuracao.CampoClienteVIP);
        var linhaClienteVIP = VC.GSC.obterObjetoDoCap(this.Configuracao.CampoClienteVIP);

        // Quando for uma nova solicitação, adiciona o evento de focusout no campo "Código do Cliente SAP"
        if (CAPContext.currentWorkflowActionIndex == -1) {
            linhaClienteVIP.row.hide();
            if (controleCodigoClienteSAP.val() == "") {
                $(controleClienteVIP).siblings().prop('checked', false);
            }
            this.setClienteVIPFocus();
        }
        else {
            // Se for detalhe da solicitação e existir o checkbox, ou seja, o campo é editável e configuramos o focusout do campo "Código do Cliente SAP"
            linhaClienteVIP.row.hide();
            if (controleClienteVIP.attr('type') == "checkbox") {
                // Adicionamos o label a primeira vez, caso o checkbox está setado
                if (!controleClienteVIP.siblings().prop('checked')) {
                    controleCodigoClienteSAP.parent().css("float", "left");
                    controleCodigoClienteSAP.parent().parent().append("<label style='float:left; margin-left: 10px; margin-top: 3px; color: blue; font-weight: bold;'>VIP</label>");
                }
                this.setClienteVIPFocus();
            }
            else {
                // Quando o campo não for editável, altera-se o valor caso seja cliente VIP
                if (controleClienteVIP.text().trim() == "Yes" || controleClienteVIP.text().trim() == "Sim") {
                    controleCodigoClienteSAP.append("<label style='margin-left: 10px; margin-top: 3px; color: blue; font-weight: bold;'>VIP</label>");
                }
            }
        }

        return false;
    },

    onQuerySucceeded: function (sender, args) {
        var listItemEnumerator = VC.GSC.ClienteVIP.Configuracao.collListItem.getEnumerator();
        var controleCodigoClienteSAP = VC.GSC.obterControleDoCap(VC.GSC.ClienteVIP.Configuracao.CodigoClienteSAP);
        var controleClienteVIP = VC.GSC.obterControleDoCap(VC.GSC.ClienteVIP.Configuracao.CampoClienteVIP);
        var linhaClienteVIP = VC.GSC.obterObjetoDoCap(VC.GSC.ClienteVIP.Configuracao.CampoClienteVIP);

        controleCodigoClienteSAP.parent().parent().children("label").remove();
        controleClienteVIP.siblings().prop('checked', false);
        controleClienteVIP.next().prop("value", false);

        while (listItemEnumerator.moveNext()) {
            var oListItem = listItemEnumerator.get_current();
            controleCodigoClienteSAP.parent().css("float", "left");
            controleCodigoClienteSAP.parent().parent().append("<label style='float:left; margin-left: 10px; margin-top: 3px; color: blue; font-weight: bold;'>VIP</label>");
            controleClienteVIP.siblings().prop('checked', true);
            controleClienteVIP.next().prop("value", true);
        }
    },

    onQueryFailed: function (sender, args) {
        console.log('Falha na consulta do Código Cliente SAP na lista de Clientes VIP´S. \n' +
        args.get_message() + '\n' + args.get_stackTrace());
    },

    filtroVip: function (valorFiltro) {
        return '<View><Query><Where><Eq><FieldRef Name="Title"/><Value Type="Text">' + valorFiltro + '</Value></Eq></Where></Query></View>';
    },

    setClienteVIPFocus: function () {
        var controleCodigoClienteSAP = VC.GSC.obterControleDoCap(this.Configuracao.CodigoClienteSAP);
        controleCodigoClienteSAP.focusout(function (e) {
            var siteUrl = _spPageContextInfo.webAbsoluteUrl;
            var clientContext = SP.ClientContext.get_current();
            var oList = clientContext.get_web().get_lists().getByTitle("ClientesVIPs");

            var camlQuery = new SP.CamlQuery();
            camlQuery.set_viewXml(VC.GSC.ClienteVIP.filtroVip(this.value));
            VC.GSC.ClienteVIP.Configuracao.collListItem = oList.getItems(camlQuery);

            clientContext.load(VC.GSC.ClienteVIP.Configuracao.collListItem);

            clientContext.executeQueryAsync(
                Function.createDelegate(
                    this,
                    VC.GSC.ClienteVIP.onQuerySucceeded
                ),
                Function.createDelegate(
                    this,
                    VC.GSC.ClienteVIP.onQueryFailed
                )
            );
        });
    }
};

VC.GSC.OTC = VC.GSC.OTC || {
    Configuracao: {
        CampoCausaRaiz: "Causa Raiz",
        CampoFrenteOTC: "Frente OTC",
        CampoErroOuRotina: "Erro ou Rotina",
        CampoAcao: "Ação",
		CampoSLA: "SLA Total (hr)",
        CampoFiltroFrenteOTC: "Causa Raiz",
        CampoFiltroErroOuRotina: "Causa Raiz",
        CampoFiltroAcao: "Causa Raiz",
		CampoFiltroSLA: "Causa Raiz",
        CampoFiltroCausaRaiz: "",
        FiltroErroOuRotina: [],
		FiltroSLA: [],
        FiltroAcao: [],
        FiltroFrenteOTC: [],
        // CR => filtro por Causa Raiz, AC => Ação, FO => filtro pela Frente OTC, ER => filtro Erro ou Rotina
        FiltroCausaRaiz: [
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Cad - Cadastro fora do prazo','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Cad - Conduta Inadequada','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Cad - Gestão de Cadastro (vendedores atualizados no SAP)','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Cad - Problemas com atendimento','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Car - Tratativa incorreta','ER':'Rotina','SLA':'95'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Cob - Conduta inadequada','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Cob - Dúvidas do cliente','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Com - Conduta inadequada vendedor externo','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Com - Falta de retorno do vendedor externo','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Com - Falta de visita vendedor externo','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Com - Informação incorreta','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Com - Programação incorreta','ER':'Rotina','SLA':'95'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Com - Sinistro','ER':'Rotina','SLA':'570'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Crc - Conduta inadequada do vendedor Interno','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Crc - Falta de retorno ativo','ER':'Rotina','SLA':'95'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Crc - informação incorreta','ER':'Rotina','SLA':'95'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Crc - Pedido não solicitado','ER':'Rotina','SLA':'95'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Crc - Problemas com pedido de Sacaria','ER':'Rotina','SLA':'95'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Crc - Programação incorreta','ER':'Rotina','SLA':'95'},
     {'FO':'Gerir Produto','AC':'Reclamação de Serviços','CR':'Fab - Qualidade da sacaria','ER':'Erro','SLA':'95'},
     {'FO':'Gerir Produto','AC':'Reclamação de Serviços','CR':'Fab - Problemas de sacaria','ER':'Erro','SLA':'133'},
     {'FO':'Gerir Produto','AC':'Reclamação de Serviços','CR':'Fab - Peso divergente da embalagem','ER':'Erro','SLA':'133'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Fis - Divergência Fiscal','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Gt - Gestão de carteira de vendedores','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Atendimento logística','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Cobrança Adicional de Frete no Cliente','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Conduta inadequada do funcionário','ER':'Rotina','SLA':'133'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Conduta inadequeada do motorista','ER':'Rotina','SLA':'95'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Conduta inadequeada dos chapas','ER':'Rotina','SLA':'95'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Demora no cadastro do motorista','ER':'Rotina','SLA':'95'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Devolução não lançada','ER':'Rotina','SLA':'95'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Dificuldade de frete na região','ER':'Rotina','SLA':'133'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Envio de produto vencido','ER':'Rotina','SLA':'133'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Falta de produto','ER':'Rotina','SLA':'133'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Frete em desacordo com o pré-estabelecido','ER':'Rotina','SLA':'95'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Palete inadequado','ER':'Rotina','SLA':'95'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Problemas com a entrega','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Problemas com enlonamento','ER':'Rotina','SLA':'95'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Sacaria molhada','ER':'Rotina','SLA':'133'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Sacaria não entregue','ER':'Rotina','SLA':'133'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Sacaria rasgada','ER':'Rotina','SLA':'133'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Serviços de entrega diferente do solicitado','ER':'Rotina','SLA':'133'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Sinistro','ER':'Rotina','SLA':'570'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Log - Troca de Boleto ou Nota Fiscal na Entrega','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Ope - Atraso na entrega Egx','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Ope - Conduta inadequada do motorista','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Ope - Problemas com a entrega','ER':'Rotina','SLA':'95'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Ope - Serviço terceirizado (bomba)','ER':'Rotina','SLA':'95'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Ope - Serviços de entrega diferente do solicitado','ER':'Rotina','SLA':'28,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Ope - Sinistro','ER':'Rotina','SLA':'570'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Opv - Conduta inadequada','ER':'Rotina','SLA':'570'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Opv - Tratativa incorreta','ER':'Rotina','SLA':'142,5'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Pre - Tratativa incorreta','ER':'Rotina','SLA':'133'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Sup - Conduta inadequada','ER':'Rotina','SLA':'570'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Cli - Reajuste de preço pedido à vista','ER':'Rotina','SLA':'133'},
     {'FO':'Atender cliente','AC':'Reclamação de Serviços','CR':'Cli - Reajuste de preço pedido a prazo','ER':'Rotina','SLA':'133'}
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

    // Função que irá filtrar as causas raizes.
    filtrarCausaRaiz: function () {
        var controleCausaRaiz = VC.GSC.obterControleDoCap(VC.GSC.OTC.Configuracao.CampoCausaRaiz);
        //obter campos a serem ocultados			
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
                // Será oculto todas as opções do combo Causa Raiz para mostrar
                // apenas as opções relacionadas ao que foi selecionado no campo de filtro
                $.each(valores, function (key, value) {
                    // o value possui três valores
                    // posição 0 => causa raiz correspondentes ao valor que foi selecionado
                    // posição 1 => se é erro ou rotina
                    // posição 2 => ação
                    var causaRaiz = value['CR'];
                    valoresVisiveis.push(causaRaiz);
                });
                VC.GSC.OTC.Configuracao.FiltroErroOuRotina = VC.GSC.OTC.Configuracao.FiltroErroOuRotina.concat(valores);
                VC.GSC.OTC.Configuracao.FiltroFrenteOTC = VC.GSC.OTC.Configuracao.FiltroFrenteOTC.concat(valores);
                VC.GSC.OTC.Configuracao.FiltroAcao = VC.GSC.OTC.Configuracao.FiltroAcao.concat(valores);
				VC.GSC.OTC.Configuracao.FiltroSLA = VC.GSC.OTC.Configuracao.FiltroSLA.concat(valores);
				VC.GSC.OTC.ocultarTodasOpcoes(controleCausaRaiz);
                VC.GSC.OTC.habilitarOpcoes(controleCausaRaiz, valoresVisiveis);
				
				VC.GSC.OTC.filtrarSLA();
				VC.GSC.OTC.filtrarErroOuRotina();
				VC.GSC.OTC.filtrarAcao();
				VC.GSC.OTC.filtrarFrenteOTC();
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
            // Será oculto todas as opções do combo Causa Raiz para mostrar
            // apenas as opções relacionadas ao que foi selecionado no campo de filtro
            VC.GSC.OTC.ocultarTodasOpcoes(controleCausaRaiz);
            $.each(valores, function (key, value) {
                // o value possui três valores
                // posição 0 => causa raiz correspondentes ao valor que foi selecionado
                // posição 1 => se é erro ou rotina
                // posição 2 => ação
                var causaRaiz = value['CR'];
                valoresVisiveis.push(causaRaiz);
            });
			
            VC.GSC.OTC.Configuracao.FiltroErroOuRotina = VC.GSC.OTC.Configuracao.FiltroErroOuRotina.concat(valores);
            VC.GSC.OTC.Configuracao.FiltroFrenteOTC = VC.GSC.OTC.Configuracao.FiltroFrenteOTC.concat(valores);
            VC.GSC.OTC.Configuracao.FiltroAcao = VC.GSC.OTC.Configuracao.FiltroAcao.concat(valores);
			VC.GSC.OTC.Configuracao.FiltroSLA = VC.GSC.OTC.Configuracao.FiltroSLA.concat(valores);
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
	
	filtrarSLA: function () {
        if (this.Configuracao.CampoFiltroSLA != "" && VC.GSC.existeCampo(this.Configuracao.CampoSLA)) {
            var controle = VC.GSC.obterControleDoCap(this.Configuracao.CampoSLA);
            if (!(controle.is('input') || controle.is('select'))) {
                console.log('controle não editável');
                return;
            }

            if (VC.GSC.obterControleDoCap(VC.GSC.OTC.Configuracao.CampoCausaRaiz).val() != "__SELECT__") {
                var valorFiltro = VC.GSC.obterControleDoCap(VC.GSC.OTC.Configuracao.CampoFiltroSLA).val();
                var valSLA = "";
                $.each(VC.GSC.OTC.Configuracao.FiltroSLA, function (i, value) {
                    if (value['CR'] == valorFiltro) {
                        valSLA = value["SLA"];
                        controle.val(validarLabelSLA(valSLA));
                        return;
                    }
                });
				
				valSLA = validarLabelSLA(valSLA);
				
                if($('#lblSLA').val() == undefined){
					controle.closest('td').append("<label id='lblSLA' style='color:blue;font-weight:bold;'>" + valSLA + "</label>");
				}
				else{
					$('#lblSLA').text(valSLA);
				}
            }

            VC.GSC.obterControleDoCap(this.Configuracao.CampoFiltroSLA).change(function () {
                var valorFiltro = $(this).val();
                var valSLA = "";
                $.each(VC.GSC.OTC.Configuracao.FiltroSLA, function (i, value) {
                    if (value['CR'] == valorFiltro) {
                        valSLA = value["SLA"];
                        controle.val(validarLabelSLA(valSLA));
                        return;
                    }
                });
				
				valSLA = validarLabelSLA(valSLA);
				controle.val(valSLA);
				controle.hide();
				if($('#lblSLA').val() == undefined){
					controle.closest('td').append("<label id='lblSLA' style='color:blue;font-weight:bold;'>" + valSLA + "</label>");
				}
				else{
					$('#lblSLA').text(valSLA);
				}
            });
        }
    },
	
    init: function () {
        if (CAPContext.currentWorkflowActionIndex == -1	||
            CAPContext.currentWorkflowActionIndex == 1	||
            CAPContext.currentWorkflowActionIndex == 2	||
            CAPContext.currentWorkflowActionIndex == 3	||
            CAPContext.currentWorkflowActionIndex == 4	||
            CAPContext.currentWorkflowActionIndex == 5	||
            CAPContext.currentWorkflowActionIndex == 6	||
            CAPContext.currentWorkflowActionIndex == 7	||
            CAPContext.currentWorkflowActionIndex == 8	||
            CAPContext.currentWorkflowActionIndex == 9	||
            CAPContext.currentWorkflowActionIndex == 10	||
            CAPContext.currentWorkflowActionIndex == 11	||
            CAPContext.currentWorkflowActionIndex == 12	||
            CAPContext.currentWorkflowActionIndex == 13	||
			CAPContext.currentWorkflowActionIndex == 14 ||
			CAPContext.currentWorkflowActionIndex == 15){
			
            VC.GSC.obterControleDoCap(this.Configuracao.CampoFrenteOTC).hide();
            VC.GSC.obterControleDoCap(this.Configuracao.CampoErroOuRotina).hide();
            VC.GSC.obterControleDoCap(this.Configuracao.CampoAcao).hide();
            // this.filtrarCausaRaiz();
			VC.GSC.OTC.Configuracao.FiltroErroOuRotina = VC.GSC.OTC.Configuracao.FiltroCausaRaiz;
            VC.GSC.OTC.Configuracao.FiltroFrenteOTC = VC.GSC.OTC.Configuracao.FiltroCausaRaiz;
            VC.GSC.OTC.Configuracao.FiltroAcao = VC.GSC.OTC.Configuracao.FiltroCausaRaiz;
			VC.GSC.OTC.Configuracao.FiltroSLA = VC.GSC.OTC.Configuracao.FiltroCausaRaiz;
			
			this.filtrarSLA();
            this.filtrarErroOuRotina();
            this.filtrarAcao();
            this.filtrarFrenteOTC();
        }
    }
};

function validarLabelSLA(valorSLA) {
    if (VC.GSC.existeCampo('GSC_SLA_Hours') &&
	VC.GSC.existeCampo('GSC_SLA_Minutes') &&
	VC.GSC.existeCampo('GSC_SLA_Days')) {
        var objetoGSCHoras = VC.GSC.obterObjetoDoCap('GSC_SLA_Hours');
        var objetoGSCMinutos = VC.GSC.obterObjetoDoCap('GSC_SLA_Minutes');
        var objetoGSCDias = VC.GSC.obterObjetoDoCap('GSC_SLA_Days');
        if (valorSLA.indexOf(',') > -1) {
            valorSLA = valorSLA.replace(',', '.');
        }

        var dias = 0;
        var horas = 0;
        var minutos = 0;
        var respString = "";

        if (valorSLA >= 9.5) {
            valorSLA = valorSLA / 9.5;
            dias = parseInt(valorSLA, 10);
            valorSLA = Math.round((valorSLA - dias) * 9.5);
        }
        if (dias > 0) {
            objetoGSCDias.control.val(dias);
            respString = dias + " Dias ";
        }
        else {
            objetoGSCDias.control.val(0);
        }
        horas = valorSLA;

        if (horas % 1 != 0) {
            horas = parseInt(valorSLA, 10);
            valorSLA = Math.round((valorSLA - horas) * 60);
        }
        else {
            valorSLA = 0;
        }
        if (horas > 0) {
            objetoGSCHoras.control.val(horas);
            respString += horas + " Horas ";
        }
        else {
            objetoGSCHoras.control.val(0);
        }

        minutos = valorSLA;
        if (minutos % 1 != 0) {
            valorSLA = valorSLA / 60;
            minutos = valorSLA;
        }
        else {
            valorSLA = 0;
        }
        if (minutos > 0) {
            objetoGSCMinutos.control.val(minutos);
            respString += minutos + " Minutos";
        }
        else {
            objetoGSCMinutos.control.val(0);
        }
    }

    return respString += " úteis";
}

function definirLayoutSLA(){
    if(VC.GSC.existeCampo('SLA Total (hr)')){
        var controleSLA = VC.GSC.obterControleDoCap('SLA Total (hr)');
        var valorSLA = "";
		
        if(controleSLA.is('input')){
            valorSLA = controleSLA.val();
            controleSLA.hide();
        }
        else{
            valorSLA = controleSLA.text().trim();
            controleSLA.find('span').hide()
        }
		
		if($('#lblSLA').val() == undefined){
			controleSLA.closest('td').append(
				"<label id='lblSLA'>" + valorSLA + "</label>"
			);
		}
		else{
			$('#lblSLA').text(valorSLA + " Horas úteis");
		}
		
        if(controleSLA.is('input') && controleSLA.val() == ""){
            $('#lblSLA').text('');
        }
        $('#lblSLA').css("color", "blue").css("font-weight", "bold");
    }
}

function removeOuAdicionaObrigatoriedade(campo, obrigatorio) {
    if(!campo){
        console.log('campo was undefined on removeOuAdicionaObrigatoriedade');
        return;
    }
   
    campo.closest('td').find('div span[id$=Validator]').prop('enabled', obrigatorio);
    if (obrigatorio) {
        campo.closest('tr').find('span[title=Requerido]').show();
    }
    else {
        campo.closest('tr').find('span[title=Requerido]').hide();
    }
}


function configurarSeparadores(){
	VC.GSC.adicionarSeparador("Cliente VIP", "Informações do Solicitante");
	
	if(CAPContext.currentWorkflowActionIndex >= 1){
		VC.GSC.adicionarSeparador("A reclamação atende todos os parametros?", "Informações do SAC - Analisar Solicitação");
	}

        if(CAPContext.currentWorkflowActionIndex >= 2){
		VC.GSC.adicionarSeparador("Diagnóstico Cadastro", "Informações do Cadastro - Analisar Solicitação");
	}

        if(CAPContext.currentWorkflowActionIndex >= 3){
		VC.GSC.adicionarSeparador("Diagnóstico Financeiro", "Informações do Financeiro - Analisar Solicitação");
	}

        if(CAPContext.currentWorkflowActionIndex >= 4){
		VC.GSC.adicionarSeparador("Diagnóstico Comercial", "Informações do Comercial - Analisar Solicitação");
	}

        if(CAPContext.currentWorkflowActionIndex >= 5){
		VC.GSC.adicionarSeparador("Diagnóstico CRC", "Informações da CRC - Analisar Solicitação");
	}
	if(CAPContext.currentWorkflowActionIndex >= 6){
		VC.GSC.adicionarSeparador("WEB - Relato do cliente procede?", "Informações da WEB - Analisar Solicitação");
	}

        if(CAPContext.currentWorkflowActionIndex >= 7){
		VC.GSC.adicionarSeparador("Diagnóstico Fábrica", "Informações da Fábrica - Analisar Solicitação");
	}

        if(CAPContext.currentWorkflowActionIndex >= 8){
		VC.GSC.adicionarSeparador("Diagnóstico Logística", "Informações da Logística - Analisar Solicitação");
	}

        if(CAPContext.currentWorkflowActionIndex >= 9){
		VC.GSC.adicionarSeparador("Diagnóstico Fiscal", "Informações do Fiscal - Analisar Solicitação");
	}

        if(CAPContext.currentWorkflowActionIndex >= 10){
		VC.GSC.adicionarSeparador("Diagnóstico Suprimentos", "Informações do Suprimentos - Analisar Solicitação");
	}

        if(CAPContext.currentWorkflowActionIndex >= 11){
		VC.GSC.adicionarSeparador("Diagnóstico OPV", "Informações do OPV - Analisar Solicitação");
	}

        if(CAPContext.currentWorkflowActionIndex >= 12){
		VC.GSC.adicionarSeparador("Diagnóstico GT", "Informações da GT - Analisar Solicitação");
	}

        if(CAPContext.currentWorkflowActionIndex >= 13){
		VC.GSC.adicionarSeparador("Diagnóstico Precificação", "Informações da Precificação - Analisar Solicitação");
	}

        if(CAPContext.currentWorkflowActionIndex >= 14){
		VC.GSC.adicionarSeparador("Diagnóstico Usina", "Informações da Usina - Analisar Solicitação");
	}

        if(CAPContext.currentWorkflowActionIndex >= 15){
		VC.GSC.adicionarSeparador("Há necessidade de ressarcimento?", "Informações do SAC - Analisar Retorno");
	}

        if(CAPContext.currentWorkflowActionIndex >= 16){
		VC.GSC.adicionarSeparador("Justificativa", "Informações do SAC - Aguardando Retorno do Cliente");
	}

        if(CAPContext.currentWorkflowActionIndex >= 17){
		VC.GSC.adicionarSeparador("Diagnóstico - SAC Ressarcimento", "Informações do SAC - Realizar Ressarcimento");
	}

        if(CAPContext.currentWorkflowActionIndex >= 18){
		VC.GSC.adicionarSeparador("Sucesso na primeira tentativa de contato?", "Informações do SAC - Primeira devolutiva ao cliente");
	}

        if(CAPContext.currentWorkflowActionIndex >= 19){
		VC.GSC.adicionarSeparador("Sucesso na segunda tentativa de contato?", "Informações do SAC - Segunda devolutiva ao cliente");
	}

        if(CAPContext.currentWorkflowActionIndex >= 20){
		VC.GSC.adicionarSeparador("Sucesso na terceira tentativa de contato?", "Informações do SAC - Terceira devolutiva ao cliente");
	}
}

function validarProduto(){
	if(CAPContext.currentWorkflowActionIndex == -1 && VC.GSC.existeCampo('Causa Raiz')) {
	var controleAdiciona = VC.GSC.obterControleDoCap('Causa Raiz');
	var objetoModal = VC.GSC.obterObjetoDoCap('Modalidade');
	var objetoGrupo = VC.GSC.obterObjetoDoCap('Grupo do Produto');
	var objetoProduto = VC.GSC.obterObjetoDoCap('Produto');
	var objetoQuanti1 = VC.GSC.obterObjetoDoCap('Quantidade do produto com problema');
	var objetoDeseja2 = VC.GSC.obterObjetoDoCap('Deseja adicionar um segundo produto?');
	var objetoSegundo_Grupo = VC.GSC.obterObjetoDoCap('Grupo do segundo produto');
	var objetoSegundo = VC.GSC.obterObjetoDoCap('Segundo produto');
	var objetoQuanti2 = VC.GSC.obterObjetoDoCap('Quantidade do segundo produto com problema');
	var objetoOutro_Produto = VC.GSC.obterObjetoDoCap('Deseja adicionar um terceiro produto?');
	var objetoTerceiro_Grupo = VC.GSC.obterObjetoDoCap('Grupo do terceiro produto');
	var objetoTerceiro = VC.GSC.obterObjetoDoCap('Terceiro produto');
	var objetoQuanti3 = VC.GSC.obterObjetoDoCap('Quantidade do terceiro produto com problema');

	objetoModal.row.hide();
	objetoGrupo.row.hide();
	objetoProduto.row.hide();
	objetoQuanti1.row.hide();
	objetoDeseja2.row.hide();
	objetoSegundo_Grupo.row.hide();
	objetoSegundo.row.hide();
	objetoQuanti2.row.hide();
	objetoOutro_Produto.row.hide();
	objetoTerceiro_Grupo.row.hide();
	objetoTerceiro.row.hide();
	objetoQuanti3.row.hide();

	controleAdiciona.change(function(){
	var controleAdiciona = VC.GSC.obterControleDoCap('Causa Raiz');
	var objetoModal = VC.GSC.obterObjetoDoCap('Modalidade');
	var objetoGrupo = VC.GSC.obterObjetoDoCap('Grupo do Produto');
	var objetoProduto = VC.GSC.obterObjetoDoCap('Produto');
	var objetoQuanti1 = VC.GSC.obterObjetoDoCap('Quantidade do produto com problema');
	var objetoDeseja2 = VC.GSC.obterObjetoDoCap('Deseja adicionar um segundo produto?');
	var objetoSegundo_Grupo = VC.GSC.obterObjetoDoCap('Grupo do segundo produto');
	var objetoSegundo = VC.GSC.obterObjetoDoCap('Segundo produto');
	var objetoQuanti2 = VC.GSC.obterObjetoDoCap('Quantidade do segundo produto com problema');
	var objetoOutro_Produto = VC.GSC.obterObjetoDoCap('Deseja adicionar um terceiro produto?');
	var objetoTerceiro_Grupo = VC.GSC.obterObjetoDoCap('Grupo do terceiro produto');
	var objetoTerceiro = VC.GSC.obterObjetoDoCap('Terceiro produto');
	var objetoQuanti3 = VC.GSC.obterObjetoDoCap('Quantidade do terceiro produto com problema');

	if (controleAdiciona.val() == "Log - Envio de produto vencido" || controleAdiciona.val() == "Log - Falta de produto" || controleAdiciona.val() == "Log - Sacaria molhada" || controleAdiciona.val() == "Log - Sacaria rasgada" || controleAdiciona.val() == "Log - Sacaria não entregue") {
		objetoModal.row.show();
		objetoGrupo.row.show();
		objetoProduto.row.show();
		objetoQuanti1.row.show();
		objetoDeseja2.row.show();
		objetoSegundo_Grupo.row.hide();
		objetoSegundo.row.hide();
		objetoQuanti2.row.hide();
		objetoOutro_Produto.row.hide();
		objetoTerceiro_Grupo.row.hide();
		objetoTerceiro.row.hide();
		objetoQuanti3.row.hide();
		removeOuAdicionaObrigatoriedade(objetoModal.control, true);
		removeOuAdicionaObrigatoriedade(objetoGrupo.control, true);
		removeOuAdicionaObrigatoriedade(objetoProduto.control, true);
		removeOuAdicionaObrigatoriedade(objetoQuanti1.control, true);
		removeOuAdicionaObrigatoriedade(objetoDeseja2.control, true);
		removeOuAdicionaObrigatoriedade(objetoSegundo_Grupo.control, false);
		removeOuAdicionaObrigatoriedade(objetoSegundo.control, false);
		removeOuAdicionaObrigatoriedade(objetoQuanti2.control, false);
		removeOuAdicionaObrigatoriedade(objetoOutro_Produto.control, false);
		removeOuAdicionaObrigatoriedade(objetoTerceiro_Grupo.control, false);
		removeOuAdicionaObrigatoriedade(objetoTerceiro.control, false);
		removeOuAdicionaObrigatoriedade(objetoQuanti3.control, false);
	}
    	else {
		objetoModal.row.hide();
		objetoGrupo.row.hide();
		objetoProduto.row.hide();
		objetoQuanti1.row.hide();
		objetoDeseja2.row.hide();
		objetoSegundo_Grupo.row.hide();
		objetoSegundo.row.hide();
		objetoQuanti2.row.hide();
		objetoOutro_Produto.row.hide();
		objetoTerceiro_Grupo.row.hide();
		objetoTerceiro.row.hide();
		objetoQuanti3.row.hide();
		removeOuAdicionaObrigatoriedade(objetoModal.control, false);
		removeOuAdicionaObrigatoriedade(objetoGrupo.control, false);
		removeOuAdicionaObrigatoriedade(objetoProduto.control, false);
		removeOuAdicionaObrigatoriedade(objetoQuanti1.control, false);
		removeOuAdicionaObrigatoriedade(objetoDeseja2.control, false);
		removeOuAdicionaObrigatoriedade(objetoSegundo_Grupo.control, false);
		removeOuAdicionaObrigatoriedade(objetoSegundo.control, false);
		removeOuAdicionaObrigatoriedade(objetoQuanti2.control, false);
		removeOuAdicionaObrigatoriedade(objetoOutro_Produto.control, false);
		removeOuAdicionaObrigatoriedade(objetoTerceiro_Grupo.control, false);
		removeOuAdicionaObrigatoriedade(objetoTerceiro.control, false);
		removeOuAdicionaObrigatoriedade(objetoQuanti3.control, false);
	}
	});
       }
}

function validarAtributo(){
	if(CAPContext.currentWorkflowActionIndex == -1) {
	var objeto1 = VC.GSC.obterObjetoDoCap('GSC_SLA_Days');
	var objeto2 = VC.GSC.obterObjetoDoCap('GSC_SLA_Hours');
	var objeto3 = VC.GSC.obterObjetoDoCap('GSC_SLA_Minutes');
	objeto1.row.hide();
	objeto2.row.hide();
	objeto3.row.hide();
       }
}


function validarArea(){
	if(CAPContext.currentWorkflowActionIndex == 15) {
	var controleNes = VC.GSC.obterControleDoCap('Necessário direcionar para outra área?');
	var objetoArea = VC.GSC.obterObjetoDoCap('Qual Área?');
	var objeto1 = VC.GSC.obterObjetoDoCap('Supervisor CRC');
	//var objeto2 = VC.GSC.obterObjetoDoCap('Selecione a Fábrica');
	var objeto3 = VC.GSC.obterObjetoDoCap('Regional do Fiscal');
	var objeto4 = VC.GSC.obterObjetoDoCap('Regional da GT');
	objetoArea.row.hide();
	objeto1.row.hide();
	//objeto2.row.hide();
	objeto3.row.hide();
	objeto4.row.hide();

	controleNes.change(function(){
	var controleNes = VC.GSC.obterControleDoCap('Necessário direcionar para outra área?');
	var objetoArea = VC.GSC.obterObjetoDoCap('Qual Área?');
	var objeto1 = VC.GSC.obterObjetoDoCap('Supervisor CRC');
	//var objeto2 = VC.GSC.obterObjetoDoCap('Selecione a Fábrica');
	var objeto3 = VC.GSC.obterObjetoDoCap('Regional do Fiscal');
	var objeto4 = VC.GSC.obterObjetoDoCap('Regional da GT');

	if (controleNes.val() == "Sim") {
		objetoArea.row.show();
	        objeto1.row.hide();
	  //      objeto2.row.show();
	        objeto3.row.hide();
	        objeto4.row.hide();
		removeOuAdicionaObrigatoriedade(objetoArea.control, true);
		removeOuAdicionaObrigatoriedade(objeto1.control, false);
		// removeOuAdicionaObrigatoriedade(objeto2.control, true);
		removeOuAdicionaObrigatoriedade(objeto3.control, false);
		removeOuAdicionaObrigatoriedade(objeto4.control, false);
	}
    	else {
		objetoArea.row.hide();
	        objeto1.row.hide();
	    //    objeto2.row.show();
	        objeto3.row.hide();
	        objeto4.row.hide();
		removeOuAdicionaObrigatoriedade(objetoArea.control, false);
		removeOuAdicionaObrigatoriedade(objeto1.control, false);
		//removeOuAdicionaObrigatoriedade(objeto2.control, false);
		removeOuAdicionaObrigatoriedade(objeto3.control, false);
		removeOuAdicionaObrigatoriedade(objeto4.control, false);
    		}
	});
        
	$('#outcomeRadio_Continue').click(function () {
	var controleNes = VC.GSC.obterControleDoCap('Necessário direcionar para outra área?');
	var objetoArea = VC.GSC.obterObjetoDoCap('Qual Área?');
	var objeto1 = VC.GSC.obterObjetoDoCap('Supervisor CRC');
	//var objeto2 = VC.GSC.obterObjetoDoCap('Selecione a Fábrica');
	var objeto3 = VC.GSC.obterObjetoDoCap('Regional do Fiscal');
	var objeto4 = VC.GSC.obterObjetoDoCap('Regional da GT');

	if (controleNes.val() == "Sim") {
		objetoArea.row.show();
	        objeto1.row.hide();
	  //      objeto2.row.show();
	        objeto3.row.hide();
	        objeto4.row.hide();
		removeOuAdicionaObrigatoriedade(objetoArea.control, true);
		removeOuAdicionaObrigatoriedade(objeto1.control, false);
		//removeOuAdicionaObrigatoriedade(objeto2.control, true);
		removeOuAdicionaObrigatoriedade(objeto3.control, false);
		removeOuAdicionaObrigatoriedade(objeto4.control, false);
	}
    	else {
		objetoArea.row.hide();
	        objeto1.row.hide();
	      //  objeto2.row.show();
	        objeto3.row.hide();
	        objeto4.row.hide();
		removeOuAdicionaObrigatoriedade(objetoArea.control, false);
		removeOuAdicionaObrigatoriedade(objeto1.control, false);
		//removeOuAdicionaObrigatoriedade(objeto2.control, false);
		removeOuAdicionaObrigatoriedade(objeto3.control, false);
		removeOuAdicionaObrigatoriedade(objeto4.control, false);
    		}
        	});
       }
}

function visibilidadeCoordenador(controleOTC, objetoFrenteOTC) {
	var strResposta = controleOTC.is('select') ? controleOTC.val(): controleOTC.text().trim();
	
	if (strResposta == 'Crc - Conduta inadequada do vendedor Interno' || strResposta == 'Log - Conduta inadequada do funcionário' || strResposta == 'Com - Conduta inadequada vendedor externo' || strResposta == 'Ope - Conduta inadequada do motorista' || strResposta == 'Com - Falta de retorno do vendedor externo' || strResposta == 'Com - Falta de visita vendedor externo') {
	objetoFrenteOTC.row.show();
	removeOuAdicionaObrigatoriedade(objetoFrenteOTC.control, true);
	}
    else {
	objetoFrenteOTC.row.hide();
	removeOuAdicionaObrigatoriedade(objetoFrenteOTC.control, false);
    }

	$('#outcomeRadio_Continue').click(function () {
	removeOuAdicionaObrigatoriedade(objetoFrenteOTC.control, false);
        });
}


function validarCoordenador(){
	if(CAPContext.currentWorkflowActionIndex == 2) {
    	var controleCausa = VC.GSC.obterControleDoCap('Causa Raiz');
    	var objetoNome = VC.GSC.obterObjetoDoCap('Coordenador Responsável');

	visibilidadeCoordenador(controleCausa, objetoNome);
	controleCausa.change(function(){
		visibilidadeCoordenador(controleCausa, objetoNome);
	});
    }
}

function validarNecessidadeRessar(){
	if(CAPContext.currentWorkflowActionIndex == 15) {
	var controleNes = VC.GSC.obterControleDoCap('Há necessidade de ressarcimento?');
	var objeto1 = VC.GSC.obterObjetoDoCap('Protocolo de Devolução');
	var objeto2 = VC.GSC.obterObjetoDoCap('Protocolo de Reembolso');
	var objeto3 = VC.GSC.obterObjetoDoCap('Número do pedido de bonificação');
	var objeto4 = VC.GSC.obterObjetoDoCap('Protocolo da DG');
	var objeto5 = VC.GSC.obterObjetoDoCap('Tipo de ressarcimento');
	objeto1.row.hide();
	objeto2.row.hide();
	objeto3.row.hide();
	objeto4.row.hide();
	objeto5.row.hide();

	controleNes.change(function(){
	var controleNes = VC.GSC.obterControleDoCap('Há necessidade de ressarcimento?');
	var objeto1 = VC.GSC.obterObjetoDoCap('Protocolo de Devolução');
	var objeto2 = VC.GSC.obterObjetoDoCap('Protocolo de Reembolso');
	var objeto3 = VC.GSC.obterObjetoDoCap('Número do pedido de bonificação');
	var objeto4 = VC.GSC.obterObjetoDoCap('Protocolo da DG');
	var objeto5 = VC.GSC.obterObjetoDoCap('Tipo de ressarcimento');

	if (controleNes.val() == "Sim") {
		objeto1.row.hide();
		objeto2.row.hide();
		objeto3.row.hide();
		objeto4.row.hide();
		objeto5.row.show();
		removeOuAdicionaObrigatoriedade(objeto1.control, false);
		removeOuAdicionaObrigatoriedade(objeto2.control, false);
		removeOuAdicionaObrigatoriedade(objeto3.control, false);
		removeOuAdicionaObrigatoriedade(objeto4.control, false);
		removeOuAdicionaObrigatoriedade(objeto5.control, true);
	}

	else {
		objeto1.row.hide();
		objeto2.row.hide();
		objeto3.row.hide();
		objeto4.row.hide();
		objeto5.row.hide();
		removeOuAdicionaObrigatoriedade(objeto1.control, false);
		removeOuAdicionaObrigatoriedade(objeto2.control, false);
		removeOuAdicionaObrigatoriedade(objeto3.control, false);
		removeOuAdicionaObrigatoriedade(objeto4.control, false);
		removeOuAdicionaObrigatoriedade(objeto5.control, false);
    		}
	});
        
	$('#outcomeRadio_Continue').click(function () {
	var controleNes = VC.GSC.obterControleDoCap('Há necessidade de ressarcimento?');
	var objeto1 = VC.GSC.obterObjetoDoCap('Protocolo de Devolução');
	var objeto2 = VC.GSC.obterObjetoDoCap('Protocolo de Reembolso');
	var objeto3 = VC.GSC.obterObjetoDoCap('Número do pedido de bonificação');
	var objeto4 = VC.GSC.obterObjetoDoCap('Protocolo da DG');
	var objeto5 = VC.GSC.obterObjetoDoCap('Tipo de ressarcimento');

	if (controleNes.val() == "Sim") {
		objeto1.row.hide();
		objeto2.row.hide();
		objeto3.row.hide();
		objeto4.row.hide();
		objeto5.row.show();
		removeOuAdicionaObrigatoriedade(objeto1.control, false);
		removeOuAdicionaObrigatoriedade(objeto2.control, false);
		removeOuAdicionaObrigatoriedade(objeto3.control, false);
		removeOuAdicionaObrigatoriedade(objeto4.control, false);
		removeOuAdicionaObrigatoriedade(objeto5.control, true);
	}

	else {
		objeto1.row.hide();
		objeto2.row.hide();
		objeto3.row.hide();
		objeto4.row.hide();
		objeto5.row.hide();
		removeOuAdicionaObrigatoriedade(objeto1.control, false);
		removeOuAdicionaObrigatoriedade(objeto2.control, false);
		removeOuAdicionaObrigatoriedade(objeto3.control, false);
		removeOuAdicionaObrigatoriedade(objeto4.control, false);
		removeOuAdicionaObrigatoriedade(objeto5.control, false);
    		}
        	});
       }
}

function validarTipo(){
	if(CAPContext.currentWorkflowActionIndex == 15) {
	var controleTipo = VC.GSC.obterControleDoCap('Tipo de ressarcimento');
	var objeto1 = VC.GSC.obterObjetoDoCap('Protocolo de Devolução');
	var objeto2 = VC.GSC.obterObjetoDoCap('Protocolo de Reembolso');
	var objeto3 = VC.GSC.obterObjetoDoCap('Número do pedido de bonificação');
	var objeto4 = VC.GSC.obterObjetoDoCap('Protocolo da DG');
	objeto1.row.hide();
	objeto2.row.hide();
	objeto3.row.hide();
	objeto4.row.hide();

	controleTipo.change(function(){
	var controleTipo = VC.GSC.obterControleDoCap('Tipo de ressarcimento');
	var objeto1 = VC.GSC.obterObjetoDoCap('Protocolo de Devolução');
	var objeto2 = VC.GSC.obterObjetoDoCap('Protocolo de Reembolso');
	var objeto3 = VC.GSC.obterObjetoDoCap('Número do pedido de bonificação');
	var objeto4 = VC.GSC.obterObjetoDoCap('Protocolo da DG');

	if (controleTipo.val() == "Reembolso") {
		objeto1.row.hide();
		objeto2.row.show();
		objeto3.row.hide();
		objeto4.row.hide();
		removeOuAdicionaObrigatoriedade(objeto1.control, false);
		removeOuAdicionaObrigatoriedade(objeto2.control, true);
		removeOuAdicionaObrigatoriedade(objeto3.control, false);
		removeOuAdicionaObrigatoriedade(objeto4.control, false);
	}

	else if (controleTipo.val() == "Bonificação") {
		objeto1.row.hide();
		objeto2.row.hide();
		objeto3.row.show();
		objeto4.row.hide();
		removeOuAdicionaObrigatoriedade(objeto1.control, false);
		removeOuAdicionaObrigatoriedade(objeto2.control, false);
		removeOuAdicionaObrigatoriedade(objeto3.control, true);
		removeOuAdicionaObrigatoriedade(objeto4.control, false);
    		}

	else if (controleTipo.val() == "Devolução") {
		objeto1.row.show();
		objeto2.row.hide();
		objeto3.row.hide();
		objeto4.row.hide();
		removeOuAdicionaObrigatoriedade(objeto1.control, true);
		removeOuAdicionaObrigatoriedade(objeto2.control, false);
		removeOuAdicionaObrigatoriedade(objeto3.control, false);
		removeOuAdicionaObrigatoriedade(objeto4.control, false);
    		}

	else if (controleTipo.val() == "Desconto") {
		objeto1.row.hide();
		objeto2.row.hide();
		objeto3.row.hide();
		objeto4.row.show();
		removeOuAdicionaObrigatoriedade(objeto1.control, false);
		removeOuAdicionaObrigatoriedade(objeto2.control, false);
		removeOuAdicionaObrigatoriedade(objeto3.control, false);
		removeOuAdicionaObrigatoriedade(objeto4.control, true);
    		}

	else {
		objeto1.row.hide();
		objeto2.row.hide();
		objeto3.row.hide();
		objeto4.row.hide();
		removeOuAdicionaObrigatoriedade(objeto1.control, false);
		removeOuAdicionaObrigatoriedade(objeto2.control, false);
		removeOuAdicionaObrigatoriedade(objeto3.control, false);
		removeOuAdicionaObrigatoriedade(objeto4.control, false);
    		}
	});
        
	$('#outcomeRadio_Continue').click(function () {
	var controleTipo = VC.GSC.obterControleDoCap('Tipo de ressarcimento');
	var objeto1 = VC.GSC.obterObjetoDoCap('Protocolo de Devolução');
	var objeto2 = VC.GSC.obterObjetoDoCap('Protocolo de Reembolso');
	var objeto3 = VC.GSC.obterObjetoDoCap('Número do pedido de bonificação');
	var objeto4 = VC.GSC.obterObjetoDoCap('Protocolo da DG');

	if (controleTipo.val() == "Reembolso") {
		objeto1.row.hide();
		objeto2.row.show();
		objeto3.row.hide();
		objeto4.row.hide();
		removeOuAdicionaObrigatoriedade(objeto1.control, false);
		removeOuAdicionaObrigatoriedade(objeto2.control, true);
		removeOuAdicionaObrigatoriedade(objeto3.control, false);
		removeOuAdicionaObrigatoriedade(objeto4.control, false);
	}

	else if (controleTipo.val() == "Bonificação") {
		objeto1.row.hide();
		objeto2.row.hide();
		objeto3.row.show();
		objeto4.row.hide();
		removeOuAdicionaObrigatoriedade(objeto1.control, false);
		removeOuAdicionaObrigatoriedade(objeto2.control, false);
		removeOuAdicionaObrigatoriedade(objeto3.control, true);
		removeOuAdicionaObrigatoriedade(objeto4.control, false);
    		}

	else if (controleTipo.val() == "Devolução") {
		objeto1.row.show();
		objeto2.row.hide();
		objeto3.row.hide();
		objeto4.row.hide();
		removeOuAdicionaObrigatoriedade(objeto1.control, true);
		removeOuAdicionaObrigatoriedade(objeto2.control, false);
		removeOuAdicionaObrigatoriedade(objeto3.control, false);
		removeOuAdicionaObrigatoriedade(objeto4.control, false);
    		}

	else if (controleTipo.val() == "Desconto") {
		objeto1.row.hide();
		objeto2.row.hide();
		objeto3.row.hide();
		objeto4.row.show();
		removeOuAdicionaObrigatoriedade(objeto1.control, false);
		removeOuAdicionaObrigatoriedade(objeto2.control, false);
		removeOuAdicionaObrigatoriedade(objeto3.control, false);
		removeOuAdicionaObrigatoriedade(objeto4.control, true);
    		}

	else {
		objeto1.row.hide();
		objeto2.row.hide();
		objeto3.row.hide();
		objeto4.row.hide();
		removeOuAdicionaObrigatoriedade(objeto1.control, false);
		removeOuAdicionaObrigatoriedade(objeto2.control, false);
		removeOuAdicionaObrigatoriedade(objeto3.control, false);
		removeOuAdicionaObrigatoriedade(objeto4.control, false);
    		}
        	});
       }
}

function validarSegundo_Produto(){
	if((CAPContext.currentWorkflowActionIndex == -1 || CAPContext.currentWorkflowActionIndex == 1)) {
	var controleAdiciona = VC.GSC.obterControleDoCap('Deseja adicionar um segundo produto?');
	var objetoSegundo_Grupo = VC.GSC.obterObjetoDoCap('Grupo do segundo produto');
	var objetoSegundo = VC.GSC.obterObjetoDoCap('Segundo produto');
	var objetoQuan2 = VC.GSC.obterObjetoDoCap('Quantidade do segundo produto com problema');
	var objetoOutro_Produto = VC.GSC.obterObjetoDoCap('Deseja adicionar um terceiro produto?');
	var objetoTerceiro_Grupo = VC.GSC.obterObjetoDoCap('Grupo do terceiro produto');
	var objetoTerceiro = VC.GSC.obterObjetoDoCap('Terceiro produto');
	var objetoQuan3 = VC.GSC.obterObjetoDoCap('Quantidade do terceiro produto com problema');

	objetoSegundo_Grupo.row.hide();
	objetoSegundo.row.hide();
	objetoOutro_Produto.row.hide();
	objetoTerceiro_Grupo.row.hide();
	objetoTerceiro.row.hide();
	objetoQuan2.row.hide();
	objetoQuan3.row.hide();

	controleAdiciona.change(function(){
	var controleAdiciona = VC.GSC.obterControleDoCap('Deseja adicionar um segundo produto?');
	var objetoSegundo_Grupo = VC.GSC.obterObjetoDoCap('Grupo do segundo produto');
	var objetoSegundo = VC.GSC.obterObjetoDoCap('Segundo produto');
	var objetoQuan2 = VC.GSC.obterObjetoDoCap('Quantidade do segundo produto com problema');
	var objetoOutro_Produto = VC.GSC.obterObjetoDoCap('Deseja adicionar um terceiro produto?');
	var objetoTerceiro_Grupo = VC.GSC.obterObjetoDoCap('Grupo do terceiro produto');
	var objetoTerceiro = VC.GSC.obterObjetoDoCap('Terceiro produto');
	var objetoQuan3 = VC.GSC.obterObjetoDoCap('Quantidade do terceiro produto com problema');

	if (controleAdiciona.val() == "Sim") {
		objetoSegundo_Grupo.row.show();
		objetoSegundo.row.show();
		objetoQuan2.row.show();
		objetoOutro_Produto.row.show();
		objetoTerceiro_Grupo.row.hide();
		objetoTerceiro.row.hide();
		objetoQuan3.row.hide();
		removeOuAdicionaObrigatoriedade(objetoSegundo_Grupo.control, true);
		removeOuAdicionaObrigatoriedade(objetoSegundo.control, true);
		removeOuAdicionaObrigatoriedade(objetoQuan2.control, true);
		removeOuAdicionaObrigatoriedade(objetoOutro_Produto.control, true);
		removeOuAdicionaObrigatoriedade(objetoTerceiro_Grupo.control, false);
		removeOuAdicionaObrigatoriedade(objetoTerceiro.control, false);
		removeOuAdicionaObrigatoriedade(objetoQuan3.control, false);
	}
    	else {
		objetoSegundo_Grupo.row.hide();
		objetoSegundo.row.hide();
		objetoQuan2.row.hide();
		objetoOutro_Produto.row.hide();
		objetoTerceiro_Grupo.row.hide();
		objetoTerceiro.row.hide();
		objetoQuan3.row.hide();
		removeOuAdicionaObrigatoriedade(objetoSegundo_Grupo.control, false);
		removeOuAdicionaObrigatoriedade(objetoSegundo.control, false);
		removeOuAdicionaObrigatoriedade(objetoQuan2.control, false);
		removeOuAdicionaObrigatoriedade(objetoOutro_Produto.control, false);
		removeOuAdicionaObrigatoriedade(objetoTerceiro_Grupo.control, false);
		removeOuAdicionaObrigatoriedade(objetoTerceiro.control, false);
		removeOuAdicionaObrigatoriedade(objetoQuan3.control, false);
    		}
	});
        
	$('#outcomeRadio_Continue').click(function () {
	var controleAdiciona = VC.GSC.obterControleDoCap('Deseja adicionar um segundo produto?');
	var objetoSegundo_Grupo = VC.GSC.obterObjetoDoCap('Grupo do segundo produto');
	var objetoSegundo = VC.GSC.obterObjetoDoCap('Segundo produto');
	var objetoQuan2 = VC.GSC.obterObjetoDoCap('Quantidade do segundo produto com problema');
	var objetoOutro_Produto = VC.GSC.obterObjetoDoCap('Deseja adicionar um terceiro produto?');
	var objetoTerceiro_Grupo = VC.GSC.obterObjetoDoCap('Grupo do terceiro produto');
	var objetoTerceiro = VC.GSC.obterObjetoDoCap('Terceiro produto');
	var objetoQuan3 = VC.GSC.obterObjetoDoCap('Quantidade do terceiro produto com problema');

	if (controleAdiciona.val() == "Sim") {
		objetoSegundo_Grupo.row.show();
		objetoSegundo.row.show();
		objetoQuan2.row.show();
		objetoOutro_Produto.row.show();
		objetoTerceiro_Grupo.row.hide();
		objetoTerceiro.row.hide();
		objetoQuan3.row.hide();
		removeOuAdicionaObrigatoriedade(objetoSegundo_Grupo.control, true);
		removeOuAdicionaObrigatoriedade(objetoSegundo.control, true);
		removeOuAdicionaObrigatoriedade(objetoQuan2.control, true);
		removeOuAdicionaObrigatoriedade(objetoOutro_Produto.control, true);
		removeOuAdicionaObrigatoriedade(objetoTerceiro_Grupo.control, false);
		removeOuAdicionaObrigatoriedade(objetoTerceiro.control, false);
		removeOuAdicionaObrigatoriedade(objetoQuan3.control, false);
	}
    	else {
		objetoSegundo_Grupo.row.hide();
		objetoSegundo.row.hide();
		objetoQuan2.row.hide();
		objetoOutro_Produto.row.hide();
		objetoTerceiro_Grupo.row.hide();
		objetoTerceiro.row.hide();
		objetoQuan3.row.hide();
		removeOuAdicionaObrigatoriedade(objetoSegundo_Grupo.control, false);
		removeOuAdicionaObrigatoriedade(objetoSegundo.control, false);
		removeOuAdicionaObrigatoriedade(objetoQuan2.control, false);
		removeOuAdicionaObrigatoriedade(objetoOutro_Produto.control, false);
		removeOuAdicionaObrigatoriedade(objetoTerceiro_Grupo.control, false);
		removeOuAdicionaObrigatoriedade(objetoTerceiro.control, false);
		removeOuAdicionaObrigatoriedade(objetoQuan3.control, false);
    		}
        	});
       }
}

function validarTerceiro_Produto(){
	if((CAPContext.currentWorkflowActionIndex == -1 || CAPContext.currentWorkflowActionIndex == 1)) {
	var controleAdiciona = VC.GSC.obterControleDoCap('Deseja adicionar um terceiro produto?');
	var objetoTerceiro_Grupo = VC.GSC.obterObjetoDoCap('Grupo do terceiro produto');
	var objetoTerceiro = VC.GSC.obterObjetoDoCap('Terceiro produto');
	var objetoQuan3 = VC.GSC.obterObjetoDoCap('Quantidade do terceiro produto com problema');

	objetoTerceiro_Grupo.row.hide();
	objetoTerceiro.row.hide();
	objetoQuan3.row.hide();

	controleAdiciona.change(function(){
	var controleAdiciona = VC.GSC.obterControleDoCap('Deseja adicionar um terceiro produto?');
	var objetoTerceiro_Grupo = VC.GSC.obterObjetoDoCap('Grupo do terceiro produto');
	var objetoTerceiro = VC.GSC.obterObjetoDoCap('Terceiro produto');
	var objetoQuan3 = VC.GSC.obterObjetoDoCap('Quantidade do terceiro produto com problema');

	if (controleAdiciona.val() == "Sim") {
		objetoTerceiro_Grupo.row.show();
		objetoTerceiro.row.show();
		objetoQuan3.row.show();
		removeOuAdicionaObrigatoriedade(objetoTerceiro_Grupo.control, true);
		removeOuAdicionaObrigatoriedade(objetoTerceiro.control, true);
		removeOuAdicionaObrigatoriedade(objetoQuan3.control, true);
	}else{
		objetoTerceiro_Grupo.row.hide();
		objetoTerceiro.row.hide();
		objetoQuan3.row.hide();
		removeOuAdicionaObrigatoriedade(objetoTerceiro_Grupo.control, false);
		removeOuAdicionaObrigatoriedade(objetoTerceiro.control, false);
		removeOuAdicionaObrigatoriedade(objetoQuan3.control, false);
       }
	});
        
	$('#outcomeRadio_Continue').click(function () {
	var controleAdiciona = VC.GSC.obterControleDoCap('Deseja adicionar um terceiro produto?');
	var objetoTerceiro_Grupo = VC.GSC.obterObjetoDoCap('Grupo do terceiro produto');
	var objetoTerceiro = VC.GSC.obterObjetoDoCap('Terceiro produto');
	var objetoQuan3 = VC.GSC.obterObjetoDoCap('Quantidade do terceiro produto com problema');

	if (controleAdiciona.val() == "Sim") {
		objetoTerceiro_Grupo.row.show();
		objetoTerceiro.row.show();
		objetoQuan3.row.show();
		removeOuAdicionaObrigatoriedade(objetoTerceiro_Grupo.control, true);
		removeOuAdicionaObrigatoriedade(objetoTerceiro.control, true);
		removeOuAdicionaObrigatoriedade(objetoQuan3.control, true);
	}
    	else {
		objetoTerceiro_Grupo.row.hide();
		objetoTerceiro.row.hide();
		objetoQuan3.row.hide();
		removeOuAdicionaObrigatoriedade(objetoTerceiro_Grupo.control, false);
		removeOuAdicionaObrigatoriedade(objetoTerceiro.control, false);
		removeOuAdicionaObrigatoriedade(objetoQuan3.control, false);
    		}
        	});
       }
}

function visibilidadeProduto(controleCausa, objeto1, objeto2, objeto3, objeto4, objeto5, objeto6, objeto7, objeto8, objeto9, objeto10, objeto11, objeto12) {
	var strResposta = controleCausa.is('select') ? controleCausa.val(): controleCausa.text().trim();
	
	if (strResposta == 'Log - Envio de produto vencido' 
					|| strResposta == 'Log - Falta de produto' 
					|| strResposta == 'Log - Sacaria molhada' 
					|| strResposta == 'Log - Sacaria rasgada' 
					|| strResposta == 'Log - Sacaria não entregue') {

					objeto1.row.show();
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
					removeOuAdicionaObrigatoriedade(objeto1.control, true);
					removeOuAdicionaObrigatoriedade(objeto2.control, true);
					removeOuAdicionaObrigatoriedade(objeto3.control, true);
					removeOuAdicionaObrigatoriedade(objeto4.control, true);
					removeOuAdicionaObrigatoriedade(objeto5.control, true);
					removeOuAdicionaObrigatoriedade(objeto6.control, false);
					removeOuAdicionaObrigatoriedade(objeto7.control, false);
					removeOuAdicionaObrigatoriedade(objeto8.control, false);
					removeOuAdicionaObrigatoriedade(objeto9.control, false);
					removeOuAdicionaObrigatoriedade(objeto10.control, false);
					removeOuAdicionaObrigatoriedade(objeto11.control, false);
					removeOuAdicionaObrigatoriedade(objeto12.control, false);
	}else {
				objeto1.row.hide();
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
				removeOuAdicionaObrigatoriedade(objeto1.control, false);
				removeOuAdicionaObrigatoriedade(objeto2.control, false);
				removeOuAdicionaObrigatoriedade(objeto3.control, false);
				removeOuAdicionaObrigatoriedade(objeto4.control, false);
				removeOuAdicionaObrigatoriedade(objeto5.control, false);
				removeOuAdicionaObrigatoriedade(objeto6.control, false);
				removeOuAdicionaObrigatoriedade(objeto7.control, false);
				removeOuAdicionaObrigatoriedade(objeto8.control, false);
				removeOuAdicionaObrigatoriedade(objeto9.control, false);
				removeOuAdicionaObrigatoriedade(objeto10.control, false);
				removeOuAdicionaObrigatoriedade(objeto11.control, false);
				removeOuAdicionaObrigatoriedade(objeto12.control, false);
    }

	$('#outcomeRadio_Continue').click(function () {
		removeOuAdicionaObrigatoriedade(objeto1.control, false);
		removeOuAdicionaObrigatoriedade(objeto2.control, false);
		removeOuAdicionaObrigatoriedade(objeto3.control, false);
		removeOuAdicionaObrigatoriedade(objeto4.control, false);
		removeOuAdicionaObrigatoriedade(objeto5.control, false);
		removeOuAdicionaObrigatoriedade(objeto6.control, false);
		removeOuAdicionaObrigatoriedade(objeto7.control, false);
		removeOuAdicionaObrigatoriedade(objeto8.control, false);
		removeOuAdicionaObrigatoriedade(objeto9.control, false);
		removeOuAdicionaObrigatoriedade(objeto10.control, false);
		removeOuAdicionaObrigatoriedade(objeto11.control, false);
		removeOuAdicionaObrigatoriedade(objeto12.control, false);
    });
}


function validarProduto_SAC(){
	if(CAPContext.currentWorkflowActionIndex == 1) {
    	var controleCausa = VC.GSC.obterControleDoCap('Causa Raiz');
    	var objeto1 = VC.GSC.obterObjetoDoCap('Modalidade');
    	var objeto2 = VC.GSC.obterObjetoDoCap('Grupo do Produto');
    	var objeto3 = VC.GSC.obterObjetoDoCap('Produto');
    	var objeto4 = VC.GSC.obterObjetoDoCap('Quantidade do produto com problema');
    	var objeto5 = VC.GSC.obterObjetoDoCap('Deseja adicionar um segundo produto?');
    	var objeto6 = VC.GSC.obterObjetoDoCap('Grupo do segundo produto');
    	var objeto7 = VC.GSC.obterObjetoDoCap('Segundo produto');
    	var objeto8 = VC.GSC.obterObjetoDoCap('Quantidade do segundo produto com problema');
    	var objeto9 = VC.GSC.obterObjetoDoCap('Deseja adicionar um terceiro produto?');
    	var objeto10 = VC.GSC.obterObjetoDoCap('Grupo do terceiro produto');
    	var objeto11 = VC.GSC.obterObjetoDoCap('Terceiro produto');
    	var objeto12 = VC.GSC.obterObjetoDoCap('Quantidade do terceiro produto com problema');

	visibilidadeProduto(controleCausa, objeto1, objeto2, objeto3, objeto4, objeto5, objeto6, objeto7, objeto8, objeto9, objeto10, objeto11, objeto12);
	controleCausa.change(function(){
		visibilidadeProduto(controleCausa, objeto1, objeto2, objeto3, objeto4, objeto5, objeto6, objeto7, objeto8, objeto9, objeto10, objeto11, objeto12);
	});
    }
}

function validarContato1(){
	if(CAPContext.currentWorkflowActionIndex == 18 && VC.GSC.existeCampo('Sucesso na primeira tentativa de contato?')) {
	var controleDiag1 = VC.GSC.obterControleDoCap('Sucesso na primeira tentativa de contato?');
	var objetoNome = VC.GSC.obterObjetoDoCap('Nome de quem atendeu');
	var objetoFone = VC.GSC.obterObjetoDoCap('Telefone que conseguiu contato');
	objetoNome.row.hide();
	objetoFone.row.hide();

	controleDiag1.change(function(){
	var controleDiag1 = VC.GSC.obterControleDoCap('Sucesso na primeira tentativa de contato?');
	var objetoNome = VC.GSC.obterObjetoDoCap('Nome de quem atendeu');
	var objetoFone = VC.GSC.obterObjetoDoCap('Telefone que conseguiu contato');

	if (controleDiag1.val() == "Sim") {
		objetoNome.row.show();
		objetoFone.row.show();
		removeOuAdicionaObrigatoriedade(objetoNome.control, true);
		removeOuAdicionaObrigatoriedade(objetoFone.control, true);
	}
    	else {
		objetoNome.row.hide();
		objetoFone.row.hide();
		removeOuAdicionaObrigatoriedade(objetoNome.control, false);
		removeOuAdicionaObrigatoriedade(objetoFone.control, false);
    		}
	});
        
	$('#outcomeRadio_Continue').click(function () {
	var controleDiag1 = VC.GSC.obterControleDoCap('Sucesso na primeira tentativa de contato?');
	var objetoNome = VC.GSC.obterObjetoDoCap('Nome de quem atendeu');
	var objetoFone = VC.GSC.obterObjetoDoCap('Telefone que conseguiu contato');

	if (controleDiag1.val() == "Sim") {
		objetoNome.row.show();
		objetoFone.row.show();
		removeOuAdicionaObrigatoriedade(objetoNome.control, true);
		removeOuAdicionaObrigatoriedade(objetoFone.control, true);
	}
    	else {
		objetoNome.row.hide();
		objetoFone.row.hide();
		removeOuAdicionaObrigatoriedade(objetoNome.control, false);
		removeOuAdicionaObrigatoriedade(objetoFone.control, false);
    		}
        	});
       }
}

function validarContato2(){
	if(CAPContext.currentWorkflowActionIndex == 19 && VC.GSC.existeCampo('Sucesso na segunda tentativa de contato?')) {
	var controleDiag1 = VC.GSC.obterControleDoCap('Sucesso na segunda tentativa de contato?');
	var objetoNome = VC.GSC.obterObjetoDoCap('Nome de quem atendeu');
	var objetoFone = VC.GSC.obterObjetoDoCap('Telefone que conseguiu contato');
	objetoNome.row.hide();
	objetoFone.row.hide();

	controleDiag1.change(function(){
	var controleDiag1 = VC.GSC.obterControleDoCap('Sucesso na segunda tentativa de contato?');
	var objetoNome = VC.GSC.obterObjetoDoCap('Nome de quem atendeu');
	var objetoFone = VC.GSC.obterObjetoDoCap('Telefone que conseguiu contato');

	if (controleDiag1.val() == "Sim") {
		objetoNome.row.show();
		objetoFone.row.show();
		removeOuAdicionaObrigatoriedade(objetoNome.control, true);
		removeOuAdicionaObrigatoriedade(objetoFone.control, true);
	}
    	else {
		objetoNome.row.hide();
		objetoFone.row.hide();
		removeOuAdicionaObrigatoriedade(objetoNome.control, false);
		removeOuAdicionaObrigatoriedade(objetoFone.control, false);
    		}
	});
        
	$('#outcomeRadio_Continue').click(function () {
	var controleDiag1 = VC.GSC.obterControleDoCap('Sucesso na segunda tentativa de contato?');
	var objetoNome = VC.GSC.obterObjetoDoCap('Nome de quem atendeu');
	var objetoFone = VC.GSC.obterObjetoDoCap('Telefone que conseguiu contato');

	if (controleDiag1.val() == "Sim") {
		objetoNome.row.show();
		objetoFone.row.show();
		removeOuAdicionaObrigatoriedade(objetoNome.control, true);
		removeOuAdicionaObrigatoriedade(objetoFone.control, true);
	}
    	else {
		objetoNome.row.hide();
		objetoFone.row.hide();
		removeOuAdicionaObrigatoriedade(objetoNome.control, false);
		removeOuAdicionaObrigatoriedade(objetoFone.control, false);
    		}
        	});
       }
}

function validarContato3(){
	if(CAPContext.currentWorkflowActionIndex == 20 && VC.GSC.existeCampo('Sucesso na terceira tentativa de contato?')) {
	var controleDiag1 = VC.GSC.obterControleDoCap('Sucesso na terceira tentativa de contato?');
	var objetoNome = VC.GSC.obterObjetoDoCap('Nome de quem atendeu');
	var objetoFone = VC.GSC.obterObjetoDoCap('Telefone que conseguiu contato');
	objetoNome.row.hide();
	objetoFone.row.hide();

	controleDiag1.change(function(){
	var controleDiag1 = VC.GSC.obterControleDoCap('Sucesso na terceira tentativa de contato?');
	var objetoNome = VC.GSC.obterObjetoDoCap('Nome de quem atendeu');
	var objetoFone = VC.GSC.obterObjetoDoCap('Telefone que conseguiu contato');

	if (controleDiag1.val() == "Sim") {
		objetoNome.row.show();
		objetoFone.row.show();
		removeOuAdicionaObrigatoriedade(objetoNome.control, true);
		removeOuAdicionaObrigatoriedade(objetoFone.control, true);
	}
    	else {
		objetoNome.row.hide();
		objetoFone.row.hide();
		removeOuAdicionaObrigatoriedade(objetoNome.control, false);
		removeOuAdicionaObrigatoriedade(objetoFone.control, false);
    		}
	});
        
	$('#outcomeRadio_Continue').click(function () {
	var controleDiag1 = VC.GSC.obterControleDoCap('Sucesso na terceira tentativa de contato?');
	var objetoNome = VC.GSC.obterObjetoDoCap('Nome de quem atendeu');
	var objetoFone = VC.GSC.obterObjetoDoCap('Telefone que conseguiu contato');

	if (controleDiag1.val() == "Sim") {
		objetoNome.row.show();
		objetoFone.row.show();
		removeOuAdicionaObrigatoriedade(objetoNome.control, true);
		removeOuAdicionaObrigatoriedade(objetoFone.control, true);
	}
    	else {
		objetoNome.row.hide();
		objetoFone.row.hide();
		removeOuAdicionaObrigatoriedade(objetoNome.control, false);
		removeOuAdicionaObrigatoriedade(objetoFone.control, false);
    		}
        	});
       }
}

function validarQualArea(){
	if( CAPContext.currentWorkflowActionIndex == 15) {
		//CAPContext.currentWorkflowActionIndex == 1 ||

		var controleArea = VC.GSC.obterControleDoCap('Qual Área?');
		var objeto1 = VC.GSC.obterObjetoDoCap('Supervisor CRC');
		//var objeto2 = VC.GSC.obterObjetoDoCap('Selecione a Fábrica');
		var objeto3 = VC.GSC.obterObjetoDoCap('Regional do Fiscal');
		var objeto4 = VC.GSC.obterObjetoDoCap('Regional da GT');
		var objeto5 = VC.GSC.obterObjetoDoCap('Regional da Usina');
		var objeto6 = VC.GSC.obterObjetoDoCap('Escolha a Usina');
		objeto1.row.hide();
		//objeto2.row.hide();
		objeto3.row.hide();
		objeto4.row.hide();
		objeto5.row.hide();
		objeto6.row.hide();

		controleArea.change(function(){
			var controleArea = VC.GSC.obterControleDoCap('Qual Área?');
			var objeto1 = VC.GSC.obterObjetoDoCap('Supervisor CRC');
			//var objeto2 = VC.GSC.obterObjetoDoCap('Selecione a Fábrica');
			var objeto3 = VC.GSC.obterObjetoDoCap('Regional do Fiscal');
			var objeto4 = VC.GSC.obterObjetoDoCap('Regional da GT');
			var objeto5 = VC.GSC.obterObjetoDoCap('Regional da Usina');
			var objeto6 = VC.GSC.obterObjetoDoCap('Escolha a Usina');

			if (controleArea.val() == "CRC") {
					objeto1.row.show();
			//      objeto2.row.hide();
					objeto3.row.hide();
					objeto4.row.hide();
					objeto5.row.hide();
					objeto6.row.hide();
					removeOuAdicionaObrigatoriedade(objeto1.control, true);
					//removeOuAdicionaObrigatoriedade(objeto2.control, false);
					removeOuAdicionaObrigatoriedade(objeto3.control, false);
					removeOuAdicionaObrigatoriedade(objeto4.control, false);
					removeOuAdicionaObrigatoriedade(objeto5.control, false);
					removeOuAdicionaObrigatoriedade(objeto6.control, false);
		}

			else if (controleArea.val() == "Fabrica") {
				objeto1.row.hide();
		//      objeto2.row.show();
				objeto3.row.hide();
				objeto4.row.hide();
				objeto5.row.hide();
				objeto6.row.hide();
				removeOuAdicionaObrigatoriedade(objeto1.control, false);
				//removeOuAdicionaObrigatoriedade(objeto2.control, true);
				removeOuAdicionaObrigatoriedade(objeto3.control, false);
				removeOuAdicionaObrigatoriedade(objeto4.control, false);
				removeOuAdicionaObrigatoriedade(objeto5.control, false);
				removeOuAdicionaObrigatoriedade(objeto6.control, false);
		}

			else if (controleArea.val() == "Fiscal") {
				objeto1.row.hide();
			//  objeto2.row.hide();
				objeto3.row.show();
				objeto4.row.hide();
				objeto5.row.hide();
				objeto6.row.hide();
			removeOuAdicionaObrigatoriedade(objeto1.control, false);
			//removeOuAdicionaObrigatoriedade(objeto2.control, false);
			removeOuAdicionaObrigatoriedade(objeto3.control, true);
			removeOuAdicionaObrigatoriedade(objeto4.control, false);
			removeOuAdicionaObrigatoriedade(objeto5.control, false);
			removeOuAdicionaObrigatoriedade(objeto6.control, false);
		}

			else if (controleArea.val() == "GT") {
				objeto1.row.hide();
			//  objeto2.row.hide();
				objeto3.row.hide();
				objeto4.row.show();
				objeto5.row.hide();
				objeto6.row.hide();
			removeOuAdicionaObrigatoriedade(objeto1.control, false);
			//removeOuAdicionaObrigatoriedade(objeto2.control, false);
			removeOuAdicionaObrigatoriedade(objeto3.control, false);
			removeOuAdicionaObrigatoriedade(objeto4.control, true);
			removeOuAdicionaObrigatoriedade(objeto5.control, false);
			removeOuAdicionaObrigatoriedade(objeto6.control, false);
		}

			else if (controleArea.val() == "Usina") {
				objeto1.row.hide();
			//  objeto2.row.hide();
				objeto3.row.hide();
				objeto4.row.hide();
				objeto5.row.show();
				objeto6.row.show();
			removeOuAdicionaObrigatoriedade(objeto1.control, false);
			//removeOuAdicionaObrigatoriedade(objeto2.control, false);
			removeOuAdicionaObrigatoriedade(objeto3.control, false);
			removeOuAdicionaObrigatoriedade(objeto4.control, false);
			removeOuAdicionaObrigatoriedade(objeto5.control, true);
			removeOuAdicionaObrigatoriedade(objeto6.control, true);
		}

			else {
				objeto1.row.hide();
			//  objeto2.row.hide();
				objeto3.row.hide();
				objeto4.row.hide();
				objeto5.row.hide();
				objeto6.row.hide();
			removeOuAdicionaObrigatoriedade(objeto1.control, false);
			//removeOuAdicionaObrigatoriedade(objeto2.control, false);
			removeOuAdicionaObrigatoriedade(objeto3.control, false);
			removeOuAdicionaObrigatoriedade(objeto4.control, false);
			removeOuAdicionaObrigatoriedade(objeto5.control, false);
			removeOuAdicionaObrigatoriedade(objeto6.control, false);
		}
	});
        
	$('#outcomeRadio_Continue').click(function () {
			var controleArea = VC.GSC.obterControleDoCap('Qual Área?');
			var objeto1 = VC.GSC.obterObjetoDoCap('Supervisor CRC');
			//var objeto2 = VC.GSC.obterObjetoDoCap('Selecione a Fábrica');
			var objeto3 = VC.GSC.obterObjetoDoCap('Regional do Fiscal');
			var objeto4 = VC.GSC.obterObjetoDoCap('Regional da GT');
			var objeto5 = VC.GSC.obterObjetoDoCap('Regional da Usina');
			var objeto6 = VC.GSC.obterObjetoDoCap('Escolha a Usina');

			if (controleArea.val() == "CRC") {
					objeto1.row.show();
			//      objeto2.row.hide();
					objeto3.row.hide();
					objeto4.row.hide();
					objeto5.row.hide();
					objeto6.row.hide();
				removeOuAdicionaObrigatoriedade(objeto1.control, true);
				//removeOuAdicionaObrigatoriedade(objeto2.control, false);
				removeOuAdicionaObrigatoriedade(objeto3.control, false);
				removeOuAdicionaObrigatoriedade(objeto4.control, false);
				removeOuAdicionaObrigatoriedade(objeto5.control, false);
				removeOuAdicionaObrigatoriedade(objeto6.control, false);
			}

				else if (controleArea.val() == "Fabrica") {
					objeto1.row.hide();
				//  objeto2.row.show();
					objeto3.row.hide();
					objeto4.row.hide();
					objeto5.row.hide();
					objeto6.row.hide();
				removeOuAdicionaObrigatoriedade(objeto1.control, false);
				// removeOuAdicionaObrigatoriedade(objeto2.control, true);
				removeOuAdicionaObrigatoriedade(objeto3.control, false);
				removeOuAdicionaObrigatoriedade(objeto4.control, false);
				removeOuAdicionaObrigatoriedade(objeto5.control, false);
				removeOuAdicionaObrigatoriedade(objeto6.control, false);
			}

				else if (controleArea.val() == "Fiscal") {
					objeto1.row.hide();
					// objeto2.row.hide();
					objeto3.row.show();
					objeto4.row.hide();
					objeto5.row.hide();
					objeto6.row.hide();
				removeOuAdicionaObrigatoriedade(objeto1.control, false);
				// removeOuAdicionaObrigatoriedade(objeto2.control, false);
				removeOuAdicionaObrigatoriedade(objeto3.control, true);
				removeOuAdicionaObrigatoriedade(objeto4.control, false);
				removeOuAdicionaObrigatoriedade(objeto5.control, false);
				removeOuAdicionaObrigatoriedade(objeto6.control, false);
			}

				else if (controleArea.val() == "GT") {
					objeto1.row.hide();
					// objeto2.row.hide();
					objeto3.row.hide();
					objeto4.row.show();
					objeto5.row.hide();
					objeto6.row.hide();
				removeOuAdicionaObrigatoriedade(objeto1.control, false);
				// removeOuAdicionaObrigatoriedade(objeto2.control, false);
				removeOuAdicionaObrigatoriedade(objeto3.control, false);
				removeOuAdicionaObrigatoriedade(objeto4.control, true);
				removeOuAdicionaObrigatoriedade(objeto5.control, false);
				removeOuAdicionaObrigatoriedade(objeto6.control, false);
			}

				else if (controleArea.val() == "Usina") {
					objeto1.row.hide();
					// objeto2.row.hide();
					objeto3.row.hide();
					objeto4.row.hide();
					objeto5.row.show();
					objeto6.row.show();
				removeOuAdicionaObrigatoriedade(objeto1.control, false);
				// removeOuAdicionaObrigatoriedade(objeto2.control, false);
				removeOuAdicionaObrigatoriedade(objeto3.control, false);
				removeOuAdicionaObrigatoriedade(objeto4.control, false);
				removeOuAdicionaObrigatoriedade(objeto5.control, true);
				removeOuAdicionaObrigatoriedade(objeto6.control, true);
			}

				else {
					objeto1.row.hide();
					// objeto2.row.hide();
					objeto3.row.hide();
					objeto4.row.hide();
					objeto5.row.hide();
					objeto6.row.hide();
				removeOuAdicionaObrigatoriedade(objeto1.control, false);
				// removeOuAdicionaObrigatoriedade(objeto2.control, false);
				removeOuAdicionaObrigatoriedade(objeto3.control, false);
				removeOuAdicionaObrigatoriedade(objeto4.control, false);
				removeOuAdicionaObrigatoriedade(objeto5.control, false);
				removeOuAdicionaObrigatoriedade(objeto6.control, false);
			}
        });
       }
}

function validarFone(){
	if(CAPContext.currentWorkflowActionIndex == -1) {
        VC.GSC.configurarMascaraFone('VC');
       }
}

function zeraValores2(){
              if (CAPContext.currentWorkflowActionIndex == 15) {
             	var controlecaus1 = VC.GSC.obterControleDoCap('Necessário direcionar para outra área?');
             	// var controlecaus2 = VC.GSC.obterControleDoCap('Selecione a Fábrica');
             	var controlecaus3 = VC.GSC.obterControleDoCap('Regional do Fiscal');
             	var controlecaus4 = VC.GSC.obterControleDoCap('Regional da GT');
             	var controlecaus5 = VC.GSC.obterControleDoCap('Regional da Usina');
             	var controlecaus6 = VC.GSC.obterControleDoCap('Escolha a Usina');
             	var controlecaus7 = VC.GSC.obterControleDoCap('Qual Área?');

              	controlecaus1.val("__SELECT__");
              	// controlecaus2.val("__SELECT__");
              	controlecaus3.val("__SELECT__");
              	controlecaus4.val("__SELECT__");
              	controlecaus5.val("__SELECT__");
              	controlecaus6.val("__SELECT__");
              	controlecaus7.val("__SELECT__");
                }
  }


/*********************************************************************************************
 * 
 * Parametros observable para atender a solicitação do chamado  1751409
 * Cleverson Jose Cord
 * 
 *********************************************************************************************/

// Função devolve o valor do atributo 
// Index da etapa 
// Retorna o controle do atributo  
function valor_control(valor,part){
    if (part =="V"){
        return CAPContext.attributes[valor].control.val();
    }else if(part=="C"){
        return CAPContext.attributes[valor].control;
    }else if(index="i"){
        return CAPContext.currentWorkflowActionIndex;
    }
}

// Função para habilitar e desabilitar campo como obrigatório e Não 
function visible(atributo,status,requerido){
	let cap = CAPContext.attributes[atributo];
    // Desabilitar 
    if(status =="D"){
        cap.row.hide();
        cap[atributo].control.closest('tr').find('span[title=Requerido]').hide();
        cap[atributo].control.closest('td').find('div span[id$=Validator]').prop('enabled', false);

    // Habilitar como "true" para obrigatoriedade e "false" para sem obrigatóriedade   
    }else if(status =="H"){
        cap.row.show();
        if(requerido==true){
            cap.control.closest('td').find('div span[id$=Validator]').prop('enabled', true);
            cap.control.closest('tr').find('span[title=Requerido]').show();
        }    
    }
}
function habilitarProcendente(atributo,valor){
	if(valor != ""){
		let control = valor_control(atributo,"C");
		visible(atributo,"H", true)
		control.val(valor);
		visible(atributo,"D", false)
	}    
}
// Desabilita true|false objeto de atributos 
function desablita(lista,status,val){
    lista.forEach((i)=>{
        visible(i,status,val);
    });
}

// função para ocutar os itens a partir do index. 
// O index indica a partir de qual linha vamos ocutar
function ocutarInicial(dicionario,index){	
	let cont = 0;
	Object.keys(dicionario).forEach((item)=>{
		if(cont >= index){  
			// Verifica se a chave é composta por uma lista de itens
			if(dicionario[item].length > 1){
				desablita(dicionario[item],"D",false)
			}else{
				desablita([dicionario[item]],"D",false)
			}
		}
		cont++;
	});
}

// Desabilita dic de object 

function groupDisable(attr,dicionario){
 
    Object.keys(dicionario).forEach((item)=>{
        if(attr === item){
            desablita(dicionario[item],'H',true);
        }else if(attr === ""){
            desablita(dicionario[item],'D',false);
        }else{
            desablita(dicionario[item],'D',false);
        }
    });
}

function objetoAtributos(){
	let cap1 = CAPContext;
	var dicionario = new Object();

	for( i in cap1.attributes){
		  if((cap1.attributes[i].displayMode == "Required" || 
			 cap1.attributes[i].displayMode == "Edit") &
			 cap1.attributes[i].displayOrder >= 0){
			// console.log(i)
			 dicionario[i] = cap1.attributes[i].control.prevObject.selector.split(",")[0]
		  }
	  }
	return dicionario;
}



// objeto cliente para ser manipulado na etapa de abertura 
var clienteGlobal = {
	cadastro:['cadastroDeCliente'],
	prospect:['cadastrosProspect'],
	vc:['uFCliente','codigoEmissor','razaoSocial','cNPJ','regional'],
	reclameAqui:['iDReclameAqui','protocoloTeveOrigemNoReclameAqui'],
	receberSMS:['clienteDesejaReceberInformacoesDoProtocoloViaSms','telefoneCelular'],

}

// objeto de atributos criado para ser manipulado na etapa Sac Analisar
var analisarSac = {
					
	parReclamacao:["aReclamacaoAtendeTodosOsParametros"],
	causaRaiz:["causaRaiz"],
	nressarcimento:["haNecessidadeDeRessarcimento"],
	motivoAvaria:["motivoDaAvaria"],
	diagSac:["diagnosticoSAC"],
	motivoSAC:["motivoSAC"],
	motivo:["motivo"],
	matriz1e2:["possivelResolucaoNaMatriz1E2"],
	acionarCli:["precisaAcionarOCliente"],
	direcionar:["necessarioDirecionarParaOutraArea"],
	qualArea:["qualArea"],
	supervisorCRC:["supervisorCRC"],
	regionalDoFiscal:["regionalDoFiscal"],
	regionalDaGT:["regionalDaGT"],
	escolhaAUsina:["escolhaAUsina"],
	regionalDaUsina:["regionalDaUsina"],
	tipoRessarcimento:["tipoDeRessarcimento"],
	protocolo:["protocolo"],
	valor:["valor"],
	choveu:["choveuDuranteOTransporte"],
	localPallet:["localizacaoDasSacariasMolhadasNoPallet"],
	especificar:["especificar"],
	fabricaDaProducao:["fabricaDaProducao"],
	sacariaMolhada:["tipoDoCaminhao","cargaEnlonada","fabricaDaProducao","anexoFotosAVARIA"],
	sacariaRasgada:["ondeEstaAAberturaRasgoNoSaco","aCargaEstaTombada","oPalleteEstaAvariado","aCondicaoDaEstrada"],
	reclaProcedente:["reclamacaoProcedeParaOCliente"],
	diagSacRetorno:["diagnosticoSACRetorno"],
}

produtos ={
	prod2:["grupoDoSegundoProduto",
		"segundoProduto",
		"quantidadeDoSegundoProdutoComProblema",
		"desejaAdicionarUmTerceiroProduto"
	],
	prod3:["grupoDoTerceiroProduto",
		"terceiroProduto",
		"quantidadeDoTerceiroProdutoComProblema"],
}

var qualArea={
    "CRC":analisarSac.supervisorCRC,
    "Fabrica":analisarSac.fabricaDaProducao,
    "Fiscal":analisarSac.regionalDoFiscal,
    "GT":analisarSac.regionalDaGT,
    "Usina":[analisarSac.regionalDaUsina,analisarSac.escolhaAUsina],
    
}

var dictImPr = {
	1:["diagnosticoFinanceiro","financeiroRelatoDoClienteProcede"],
	3:["diagnosticoCadastro","cadastroRelatoDoClienteProcede"],
	4:["diagnosticoComercial","comercialRelatoDoClienteProcede"],
	5:["diagnosticoCRC","cRCRelatoDoClienteProcede"],
	6:["diagnosticoWEB","wEBRelatoDoClienteProcede"],
	7:["diagnosticoFabrica","fabricaRelatoDoClienteProcede"],
	8:["diagnosticoLogistica","financeiroRelatoDoClienteProcede"],
	9:["diagnosticoFiscal","fiscalRelatoDoClienteProcede"],
   10:["diagnosticoSuprimentos","suprimentoRelatoDoClienteProcede"],
   11:["diagnosticoOPV","oPVRelatoDoClienteProcede"],
   12:["diagnosticoGT","gTRelatoDoClienteProcede"],
   13:["diagnosticoPrecificacao","precificacaoRelatoDoClienteProcede"],
   14:["diagnosticoUsina","usinaRelatoDoClienteProcede"],
//    15:[analisarSac.protocolo[0],analisarSac.motivoSAC[0],analisarSac.valor[0],
//    analisarSac.diagSacRetorno[0],SAC_Analisar_Retorno("Ressarcimento"),SAC_Analisar_Retorno("reclamacao")
// ] 	
  }


 


// Edição etapa de abertura 
function clientEdition(v){

switch(v){
	case "cadastro":
		var cad = valor_control(clienteGlobal.cadastro[0],'C');
		var cad1 = cad.is('select') ? cad.val(): cad.text().trim()
		if(cad1 ==="Cliente Prospect (Não tem codigo na VC)"){
			desablita([clienteGlobal.prospect[0]],'H',true);
			desablita(clienteGlobal.vc,'D',false);
		}else{
			desablita(clienteGlobal.vc,'H',true); 
			desablita([clienteGlobal.prospect[0]],'D',false);
		}
		break
	case "reclame":
		if(valor_control(clienteGlobal.reclameAqui[1],'V')==="Sim"){
			desablita([clienteGlobal.reclameAqui[0]],'H',true);
		}else{
			desablita([clienteGlobal.reclameAqui[0]],'D',false);
		}
		break       
	case "sms":
		if(valor_control(clienteGlobal.receberSMS[0],'V')==="Sim"){
			visible(clienteGlobal.receberSMS[1],'H',true);
		}else{
			visible(clienteGlobal.receberSMS[1],'D',false);
		}
		break         

}

}

// Etapa SAC Analisar
function sacAnalisar(step){
		switch(step){
			case "aReclamacaoAtendeTodosOsParametros":
				if(valor_control(analisarSac.parReclamacao[0], "V")==="Sim"){
					ocutarInicial(analisarSac,4);
					habilitarProcendente(analisarSac.diagSac[0],"Procedente");
					visible(analisarSac.matriz1e2[0],"H", true);  
					visible(analisarSac.motivo[0],"D", false);  
					visible(analisarSac.acionarCli[0],"D", false);
				}else if(valor_control(analisarSac.parReclamacao[0], "V")==="Não"){
					ocutarInicial(analisarSac,4);
					visible(analisarSac.motivo[0],"H", true);
					visible(analisarSac.matriz1e2[0],"D", false);
					desablita([analisarSac.qualArea[0]],'D',false);
					visible(analisarSac.direcionar[0],"D", false);
                    
                    // Zerar area
                    groupDisable("",qualArea);

				}
				break
			case "motivo":
				if(valor_control(analisarSac.motivo[0], "V") ==="Falta Evidencia"){
					visible(analisarSac.acionarCli[0],"H", true);
				}else if((valor_control(analisarSac.motivo[0], "V")!=="Falta Evidencia") ){
					habilitarProcendente(analisarSac.diagSac[0],"Improcedente");
					visible(analisarSac.acionarCli[0],"D", false);
				}
			case "precisaAcionarOCliente":
				if(valor_control(analisarSac.acionarCli[0]==="Não")){
					habilitarProcendente(analisarSac.diagSac[0],"Improcedente");
				}else{
					habilitarProcendente(analisarSac.diagSac[0],"");
				}
				break
			case "possivelResolucaoNaMatriz1E2":
				if(valor_control(analisarSac.matriz1e2[0],"V")==="Sim"){
					visible(analisarSac.direcionar[0],"D", false);
					visible(analisarSac.nressarcimento[0],"H", true);
				}else{
					visible(analisarSac.direcionar[0],"H", true);
					visible(analisarSac.nressarcimento[0],"D", false);
				}
				break
			case "haNecessidadeDeRessarcimento":
				if(valor_control(analisarSac.nressarcimento[0],"V")==="Sim"){
					visible(analisarSac.tipoRessarcimento[0],"H", true);
					visible(analisarSac.valor[0],"H", true);
					visible(analisarSac.protocolo[0],"H", true);
					visible(analisarSac.motivo[0],"D", false);
				}else if(valor_control(analisarSac.nressarcimento[0],"V")==="Não"){
					visible(analisarSac.tipoRessarcimento[0],"D", false);
					visible(analisarSac.valor[0],"D",false);
					visible(analisarSac.protocolo[0],"D", false);
					visible(analisarSac.motivo[0],"H", true);
					habilitarProcendente(analisarSac.diagSac[0],"Improcedente");
				}else{
					visible(analisarSac.tipoRessarcimento[0],"D", false);
					visible(analisarSac.valor[0],"D",false);
					visible(analisarSac.protocolo[0],"D", false);
					visible(analisarSac.motivo[0],"D", false);
				}
				break
			case "causaRaiz":
				let raiz = valor_control(analisarSac.causaRaiz[0],"C");
				let raiztxt = raiz.is('select') ? raiz.val(): raiz.text().trim();
				if(raiztxt ==="Log - Avaria"){
					visible(analisarSac.motivoAvaria.toString(),"H", true);
				}else{
                    visible(analisarSac.motivoAvaria.toString(),"D", false);
                }
				break
			case "motivoDaAvaria":
				if(valor_control(analisarSac.motivoAvaria[0],"V")==="Sacaria molhada"){
					desablita([analisarSac.choveu[0]],"H", true);
					desablita([analisarSac.localPallet[0]],"H", true);

					desablita(analisarSac.sacariaMolhada,'H',true);
					desablita(analisarSac.sacariaRasgada,'D',false);
				}else if(valor_control(analisarSac.motivoAvaria[0],"V")==="Sacaria rasgada"){
					desablita([analisarSac.choveu[0]],"D", false);
					desablita([analisarSac.localPallet[0]],"D", false);

					desablita(analisarSac.sacariaMolhada,'D',false);
					desablita(analisarSac.sacariaRasgada,'H',true);
				}    
				break
		
			case "localizacaoDasSacariasMolhadasNoPallet":
				if(valor_control(analisarSac.localPallet[0],"V")==="outros"){
					desablita(analisarSac.especificar,'H',true);
				}else{
					desablita(analisarSac.especificar,'D',false);
				}    
				break
			case "necessarioDirecionarParaOutraArea":
				if(valor_control(analisarSac.direcionar[0],"V")==="Sim"){
					desablita(analisarSac.qualArea,'H',true);
				}else{
					desablita(analisarSac.qualArea,'D',false);
				}    
				break
			case "desejaAdicionarUmSegundoProduto":
				  if(valor_control("desejaAdicionarUmSegundoProduto","V")==="Sim"){
						desablita(produtos.prod2,'H',true);
				  }else{
						desablita(produtos.prod2,'D',false);
				  }    
				break
			case "desejaAdicionarUmTerceiroProduto":
				if(valor_control("desejaAdicionarUmTerceiroProduto","V")==="Sim"){
						desablita(produtos.prod3,'H',true);
				}else{
						desablita(produtos.prod3,'D',false);
				}    
				break
	
			case "qualArea":

                let area = valor_control(analisarSac.qualArea[0],"V");
                groupDisable(area, qualArea);
            break
		}
}
// SAC - Analisar Retorno
function SAC_Analisar_Retorno(valor){

	switch(valor){
		case "Ressarcimento":
				if(valor_control(analisarSac.nressarcimento[0],"V")==="Sim"){
					visible(analisarSac.valor[0],"H", true);
					visible(analisarSac.protocolo[0],"H", true);
				}else{
					console.log("Teste")
					visible(analisarSac.valor[0],"D", false);
					visible(analisarSac.protocolo[0],"D",false);
				}
				break
		case "reclamacao":
			if(valor_control(analisarSac.reclaProcedente[0],"V")==="Sim"){
				habilitarProcendente(analisarSac.diagSacRetorno[0],"Procedente");
				visible(analisarSac.motivoSAC[0],"D", false);
			}else{
				visible(analisarSac.motivoSAC[0],"H", true);
				habilitarProcendente(analisarSac.diagSacRetorno[0],"Improcedente");
			}
			break


	}


}

// Consolidação das etapas 
$(document).ready(function(){
	
	let dict = objetoAtributos();
	var index =valor_control("","i");

	
	if(index in dictImPr){
		
		visible(dictIP[index][0].toString(),"D", false);
		
		for(let i in dict) {
			try{
			var inputElem = document.getElementById(document.querySelector(dict[i]).id);
		
			if(inputElem.addEventListener){
				inputElem.addEventListener('change', function(){
				if(dictImPr[index][1]=== i ){
					if(valor_control(i.toString(),"V") =="Sim"){
						habilitarProcendente(dictImPr[index][0].toString(),"Procedente");
					}else{
						habilitarProcendente(dictImPr[index][0].toString(),"Improcedente");
					} 
				}
				}, false);
			}else{
				inputElem.attachEvent('onchange', function(){
					if(dictImPr[index][1]=== i ){
						if(valor_control(i.toString(),"V") =="Sim"){
							habilitarProcendente(dictImPr[index][0].toString(),"Procedente");
						}else{
							habilitarProcendente(dictImPr[index][0].toString(),"Improcedente");
						} 
					}
		
				},false);
			}
			}catch (error) {
				continue
			}
		}

	}

	// Etapas
    switch(index){
		case -1:
			desablita(clienteGlobal.vc,'D',false);
			desablita([clienteGlobal.reclameAqui[0]],'D',false);
			valor_control(clienteGlobal.cadastro[0],'C').change(function (){
				clientEdition("cadastro");
			});
			valor_control(clienteGlobal.reclameAqui[1],'C').change(function (){
				clientEdition("reclame");
			});
			valor_control(clienteGlobal.receberSMS[0],'C').change(function (){
				clientEdition("sms");
			});
		break

    	case 2:
			// Oculta parametro inicial 
			clientEdition("cadastro");
			sacAnalisar("causaRaiz");
			ocutarInicial(analisarSac,4);
			ocutarInicial(produtos,0);

			// Observable
			for(let i in dict) {
				try{
					var inputElem = document.getElementById(document.querySelector(dict[i]).id);
					if(inputElem !=null){
						if(inputElem.addEventListener){
							inputElem.addEventListener('change', function(){
								sacAnalisar(i);
		//						console.log(i);
							}, false);
						}else{
							inputElem.attachEvent('onchange', function(){
								sacAnalisar(i);
							},false);
						}
					}
				}catch (error) {
					continue
				}
			}
		break
		

		case 15:
			visible(analisarSac.protocolo[0],"D", false);
			visible(analisarSac.motivoSAC[0],"D", false);
			visible(analisarSac.valor[0],"D", false);
			visible(analisarSac.diagSacRetorno[0],"D", false);
			SAC_Analisar_Retorno("Ressarcimento");
			valor_control(analisarSac.reclaProcedente[0],"C").change(function (){
				SAC_Analisar_Retorno("reclamacao");
			});
			
			valor_control(analisarSac.nressarcimento[0],"C").change(function (){
				SAC_Analisar_Retorno("Ressarcimento");
			});
		break

		case 17:
			visible("diagnosticoSACRessarcimento","D", false);
			visible("motivoDoNaoRessarcimento","D", false);
			habilitarProcendente("diagnosticoSACRessarcimento","Procedente");
			valor_control("ressarcimentoRealizado","C").change(function (){
				if(valor_control("ressarcimentoRealizado","V") == "Sim"){
					visible("protocolo","H", true);
					visible("telefoneCelular","H", false);
					visible("motivoDoNaoRessarcimento","D", false);
				}else{
					visible("motivoDoNaoRessarcimento","H", true);
					visible("protocolo","D", false);
					visible("telefoneCelular","D", false);
					
				}
			});
			
		break
	}
	
	 
	  
	  

	$('#outcomeRadio_Continue').click(function () {
		switch(index){
			case 2:
				for(let i in dict) {
					if(i !=null){
						sacAnalisar(i);
					}
				}
				clientEdition("cadastro");		
			break
			
     	case 3:
			visible("diagnosticoCadastro","D", false);	
				if(valor_control("cadastroRelatoDoClienteProcede","V") =="Sim"){
					habilitarProcendente("diagnosticoCadastro","Procedente");
				}else{
					habilitarProcendente("diagnosticoCadastro","Improcedente");
				} 
		break	
		case 4:
			visible("diagnosticoComercial","D", false);	
				if(valor_control("comercialRelatoDoClienteProcede","V") =="Sim"){
					habilitarProcendente("diagnosticoComercial","Procedente");
				}else{
					habilitarProcendente("diagnosticoComercial","Improcedente");
				} 
		break	

		case 5:
			visible("diagnosticoCRC","D", false);	
				if(valor_control("cRCRelatoDoClienteProcede","V") =="Sim"){
					habilitarProcendente("diagnosticoCRC","Procedente");
				}else{
					habilitarProcendente("diagnosticoCRC","Improcedente");
				} 
		break
		case 6:
			visible("diagnosticoWEB","D", false);	
				if(valor_control("wEBRelatoDoClienteProcede","V") =="Sim"){
					habilitarProcendente("diagnosticoWEB","Procedente");
				}else{
					habilitarProcendente("diagnosticoWEB","Improcedente");
				} 
		break
		case 7:
			visible("diagnosticoFabrica","D", false);	
				if(valor_control("fabricaRelatoDoClienteProcede","V") =="Sim"){
					habilitarProcendente("diagnosticoFabrica","Procedente");
				}else{
					habilitarProcendente("diagnosticoFabrica","Improcedente");
				} 
		break
		
		
		case 8:
			visible("diagnosticoLogistica","D", false);	
				if(valor_control("logisticaRelatoDoClienteProcede","V") =="Sim"){
					habilitarProcendente("diagnosticoLogistica","Procedente");
				}else{
					habilitarProcendente("diagnosticoLogistica","Improcedente");
				} 
		break

		case 9:
			visible("diagnosticoFiscal","D", false);	
				if(valor_control("fiscalRelatoDoClienteProcede","V") =="Sim"){
					habilitarProcendente("diagnosticoFiscal","Procedente");
				}else{
					habilitarProcendente("diagnosticoFiscal","Improcedente");
				} 
		break	


		case 10:
			visible("diagnosticoSuprimentos","D", false);	
				if(valor_control("suprimentoRelatoDoClienteProcede","V") =="Sim"){
					habilitarProcendente("diagnosticoSuprimentos","Procedente");
				}else{
					habilitarProcendente("diagnosticoSuprimentos","Improcedente");
				} 
		break
		
		
		case 11:
			visible("diagnosticoOPV","D", false);	
				if(valor_control("oPVRelatoDoClienteProcede","V") =="Sim"){
					habilitarProcendente("diagnosticoOPV","Procedente");
				}else{
					habilitarProcendente("diagnosticoOPV","Improcedente");
				} 
		
		break


		case 12:
			visible("diagnosticoGT","D", false);	
				if(valor_control("gTRelatoDoClienteProcede","V") =="Sim"){
					habilitarProcendente("diagnosticoGT","Procedente");
				}else{
					habilitarProcendente("diagnosticoGT","Improcedente");
				} 
			
		break


		case 13:
			visible("diagnosticoPrecificacao","D", false);	
				if(valor_control("precificacaoRelatoDoClienteProcede","V") =="Sim"){
					habilitarProcendente("diagnosticoPrecificacao","Procedente");
				}else{
					habilitarProcendente("diagnosticoPrecificacao","Improcedente");
				} 
			
		break

		case 14:
			visible("diagnosticoUsina","D", false);	
				if(valor_control("usinaRelatoDoClienteProcede","V") =="Sim"){
					habilitarProcendente("diagnosticoUsina","Procedente");
				}else{
					habilitarProcendente("diagnosticoUsina","Improcedente");
				} 
			
		break
		case 15:
			visible(analisarSac.diagSacRetorno[0],"D", false);
			SAC_Analisar_Retorno("Ressarcimento");
			SAC_Analisar_Retorno("reclamacao");
			
		break

	
		case 17:
			visible("diagnosticoSACRessarcimento","D", false);
			habilitarProcendente("diagnosticoSACRessarcimento","Procedente");
				if(valor_control("ressarcimentoRealizado","V") == "Sim"){
					visible("protocolo","H", true);
					visible("telefoneCelular","H", false);
					visible("motivoDoNaoRessarcimento","D", false);
				}else{
					visible("motivoDoNaoRessarcimento","H", true);
					visible("protocolo","D", false);
					visible("telefoneCelular","D", false);
					
				}
			
			
			
		break

		}	

	});
});


function configurar() {
    VC.GSC.Configuracao.CamposDeTelefone = [
		"Telefone fixo",
                "Telefone celular",
          "Telefone que conseguiu contato"
    ];

    VC.GSC.Configuracao.CamposDeCNPJ = [
		"CNPJ"
    ];

    VC.GSC.Configuracao.CamposDeNotaFiscal = [
		"Nº Nota Fiscal"
    ];

    VC.GSC.Configuracao.CamposDeRPS = [
		"Numero da RPS"
    ];

    VC.GSC.Configuracao.CamposDeEmail = [
		"Email para Envio do Boleto",
                "Email para retorno"
    ];

    VC.GSC.Configuracao.CamposDeDinheiro = [
    ];
	
    definirLayoutSLA();
    configurarSeparadores();
    validarProduto();
    validarSegundo_Produto();
    validarTerceiro_Produto();
    validarAtributo();
	//validarApoio();
	validarArea();
    validarCoordenador();
    validarProduto_SAC();
    validarNecessidadeRessar();
	validarTipo();
    validarContato1();
    validarContato2();
    validarContato3();
    validarQualArea();
    validarFone();
    zeraValores2();
    VC.GSC.init();
}

ExecuteOrDelayUntilScriptLoaded(configurar, "sp.js");