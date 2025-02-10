document.addEventListener('DOMContentLoaded', () => {
  const switchBtn = document.querySelector('.switch');
  const container = document.querySelector('.container');
  const progress = document.querySelector('.progress');

  switchBtn.addEventListener('click', () => {
    container.classList.toggle('active');
  });

  setTimeout(() => {
    progress.classList.add('active');
  }, 1000);
});
