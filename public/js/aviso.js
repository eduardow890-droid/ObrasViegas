document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('modalAviso');
  const btnFechar = document.getElementById('btnFecharAviso');

  // Se o usuário já aceitou o aviso nesta sessão, mantém o modal oculto
  if (sessionStorage.getItem('avisoTestesLido') === 'true') {
    if (modal) modal.style.display = 'none';
  }

  // Listener seguro para o clique do botão
  if (btnFechar) {
    btnFechar.addEventListener('click', function() {
      if (modal) modal.style.display = 'none';
      // Salva no navegador que o usuário já leu o aviso nesta navegação
      sessionStorage.setItem('avisoTestesLido', 'true');
    });
  }
});