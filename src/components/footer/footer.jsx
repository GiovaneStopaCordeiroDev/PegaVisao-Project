import './footer.css'

export function footer(){
    return (
            <footer>
                <div className='conteudo-footer'>
                    <div className='footer-coluna'>
                    <h4>Categorias</h4>
                    <a href=''>Camisetas</a>
                    <a href=''>Moletons</a>
                    <a href=''>Calças</a>
                </div>
                <div className='footer-coluna'>
                    <h4>Informações</h4>
                    <a href=''>Política de trocas</a>
                    <a href=''>Privacidade</a>
                    <a href=''>Entregas</a>
                </div>
                <div className='footer-coluna'>
                    <h4>Contato</h4>
                    <a href=''>Whatsapp</a>
                    <a href=''>Instagram</a>
                    <a href=''>E-mail</a>
                </div>
                </div>
                <h3>
                    © 2026 PegaVisão. Todos os direitos reservados.
                </h3>
                
            </footer>
    )
}

export default footer