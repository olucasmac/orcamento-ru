window.jsPDF = window.jspdf.jsPDF;

document.addEventListener('DOMContentLoaded', () => {
    // Define a data atual como valor padrão
    const dataInput = document.getElementById('dataOrcamento');
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Mês é 0-indexado
    const ano = hoje.getFullYear();
    dataInput.value = `${ano}-${mes}-${dia}`;
});

function adicionarServico() {
    const tabelaServicos = document.getElementById('tabelaServicos').getElementsByTagName('tbody')[0];
    const novaLinha = tabelaServicos.insertRow();

    const qntCell = novaLinha.insertCell(0);
    const descricaoCell = novaLinha.insertCell(1);
    const valorUnitCell = novaLinha.insertCell(2);
    const totalCell = novaLinha.insertCell(3);
    const acaoCell = novaLinha.insertCell(4);

    qntCell.innerHTML = '<input type="number" class="qntServico" value="1" oninput="atualizarTotal()" required>';
    descricaoCell.innerHTML = '<input type="text" class="descricaoServico" required>';
    valorUnitCell.innerHTML = '<input type="number" class="valorUnitServico" oninput="atualizarTotal()" required>';
    totalCell.innerHTML = 'R$ 0.00';
    acaoCell.innerHTML = '<button type="button" onclick="removerServico(this)">Remover</button>';
}

function removerServico(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    atualizarTotal();
}

function atualizarTotal() {
    let total = 0;
    const linhas = document.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    for (let i = 0; i < linhas.length; i++) {
        const qnt = linhas[i].getElementsByClassName('qntServico')[0].value;
        const valorUnit = linhas[i].getElementsByClassName('valorUnitServico')[0].value;

        const subtotal = qnt * valorUnit;
        linhas[i].getElementsByTagName('td')[3].innerText = `R$ ${subtotal.toFixed(2)}`;

        total += subtotal;
    }

    document.getElementById('total').innerText = total.toFixed(2);
}

function gerarPDF() {
    const dataOrcamento = document.getElementById('dataOrcamento').value;
    const cliente = document.getElementById('cliente').value;
    const endereco = document.getElementById('endereco').value;
    const motor = document.getElementById('motor').value;
    const fone = document.getElementById('fone').value;
    const placa = document.getElementById('placa').value;
    const tabelaServicos = document.getElementById('tabelaServicos').getElementsByTagName('tbody')[0];
    const total = document.getElementById('total').innerText;

    // Carregar a imagem do logo
    const imgLogo = new Image();
    imgLogo.src = 'img/logo.png';
    imgLogo.onload = function() {
        const doc = new jsPDF();

        // Adicionar a imagem do logo no canto superior direito e aumentar o tamanho
        doc.addImage(imgLogo, 'PNG', 120, 10, 70, 35); // (imagem, formato, x, y, largura, altura)

        // Cabeçalho - ORÇAMENTO
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('ORÇAMENTO', 20, 30); // Alinhado à esquerda

        // Dados do Orçamento
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(`Data do Orçamento:`, 20, 50);
        doc.setFont('helvetica', 'bold');
        doc.text(`${dataOrcamento}`, 60, 50);

        // Dados do Cliente
        doc.setFont('helvetica', 'bold');
        doc.text('Dados do Cliente:', 20, 60);
        doc.setFont('helvetica', 'normal');
        doc.text('Nome:', 20, 70);
        doc.setFont('helvetica', 'bold');
        doc.text(`${cliente}`, 40, 70);
        doc.setFont('helvetica', 'normal');
        doc.text('Endereço:', 20, 80);
        doc.setFont('helvetica', 'bold');
        doc.text(`${endereco}`, 45, 80);
        doc.setFont('helvetica', 'normal');
        doc.text('Motor:', 20, 90);
        doc.setFont('helvetica', 'bold');
        doc.text(`${motor}`, 35, 90);
        doc.setFont('helvetica', 'normal');
        doc.text('Telefone:', 20, 100);
        doc.setFont('helvetica', 'bold');
        doc.text(`${fone}`, 45, 100);
        doc.setFont('helvetica', 'normal');
        doc.text('Placa:', 20, 110);
        doc.setFont('helvetica', 'bold');
        doc.text(`${placa}`, 35, 110);

        // Serviços
        doc.setFont('helvetica', 'bold');
        doc.text('Serviços:', 20, 130);
        let yPos = 140;

        for (let i = 0; i < tabelaServicos.rows.length; i++) {
            const qnt = tabelaServicos.rows[i].getElementsByClassName('qntServico')[0].value;
            const descricao = tabelaServicos.rows[i].getElementsByClassName('descricaoServico')[0].value;
            const valorUnit = tabelaServicos.rows[i].getElementsByClassName('valorUnitServico')[0].value;
            const totalItem = qnt * valorUnit;

            doc.setFont('helvetica', 'normal');
            doc.text(`${qnt}x ${descricao} - R$ ${totalItem.toFixed(2)}`, 20, yPos);
            yPos += 10;
        }

        // Total e Assinaturas
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: R$ ${total}`, 20, yPos + 20);

        // Carregar a imagem da assinatura
        const imgSignature = new Image();
        imgSignature.src = 'img/signature.png';
        imgSignature.onload = function() {
            // Adicionar a imagem da assinatura acima da linha do representante
            doc.addImage(imgSignature, 'PNG', 120, yPos + 30, 80, 15); // (imagem, formato, x, y, largura, altura)

            // Linhas de assinatura acima dos rótulos
            doc.line(20, yPos + 45, 100, yPos + 45); // Linha para assinatura do cliente
            doc.text('Assinatura do Cliente:', 20, yPos + 50);

            doc.line(120, yPos + 45, 200, yPos + 45); // Linha para assinatura do representante
            doc.text('Assinatura do Representante:', 120, yPos + 50);

            // Rodapé - Dados da Empresa
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('RETIFICA UNIÃO - AV. DR. JOÃO SILVA FILHO, Q-C / CASA 05 CONJ. BETÂNIA - BAIRRO: PIAUÍ', 105, 285, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.text('DAVID LIMA (RESPONSÁVEL) - Fone: (86) 9.9925-2173 - Aceitamos todos os cartões', 105, 290, { align: 'center' });

            // Baixar o PDF gerado
            doc.save('orcamento.pdf');
        };
    };
}
