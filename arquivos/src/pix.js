const axios = require("axios");

const ACCESS_TOKEN = 'APP_USR-3340000701312861-062610-4c16352890fc37c8db37ac026798fc1c-1152040212'; 

// Função para criar o pagamento via PIX
async function criarPagamentoPix(valorCompra, descricao, idempotencyKey) {
    const payment_data = {
        transaction_amount: valorCompra,
        description: descricao || 'Pagamento via PIX',
        payment_method_id: "pix",
        payer: {
            email: "jeovajmp600@gmail.com",  // Idealmente, deve ser dinâmico
            first_name: "Cliente",  // Idealmente, deve ser dinâmico
            last_name: "Teste",  // Idealmente, deve ser dinâmico
            identification: {
                type: "CPF",
                number: "12345678909"  // Idealmente, deve ser dinâmico
            }
        }
    };

    try {
        console.log("Criando pagamento PIX com valor:", valorCompra); // Log de diagnóstico
        const response = await axios.post(
            'https://api.mercadopago.com/v1/payments',
            payment_data,
            {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                    'X-Idempotency-Key': idempotencyKey
                }
            }
        );

        // Verificando a resposta da API
        console.log("Resposta da API do Mercado Pago:", response.data);

        if (response.data && response.data.point_of_interaction) {
            const pagamento = response.data;
            console.log('Pagamento criado com sucesso:', pagamento);

            return {
                id: pagamento.id,
                qr_code: pagamento.point_of_interaction.transaction_data.qr_code,
                qr_code_base64: pagamento.point_of_interaction.transaction_data.qr_code_base64
            };
        } else {
            console.error('Erro inesperado: Resposta não contém os dados esperados.');
            throw new Error('Resposta da API não contém QR code');
        }
    } catch (error) {
        console.error('Erro ao criar o pagamento:', error.response ? error.response.data : error.message);
        throw new Error('Erro ao criar o pagamento');
    }
}

module.exports = { criarPagamentoPix };