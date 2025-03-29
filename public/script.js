// Fetch PDFs from the server
function fetchPdfs() {
    fetch('/api/pdfs')
      .then(response => response.json())
      .then(pdfs => {
        const pdfList = document.getElementById('pdf-list');
        pdfList.innerHTML = '';
        pdfs.forEach(pdf => {
          const div = document.createElement('div');
          div.className = 'pdf-item';
          div.innerHTML = `
            <span>${pdf.name}</span>
            <button onclick="initiatePayment(${pdf.id})">Buy (₹${pdf.price})</button>
          `;
          pdfList.appendChild(div);
        });
      })
      .catch(error => console.error('Error fetching PDFs:', error));
  }
  
  // Handle PDF upload with authentication
  const uploadForm = document.getElementById('upload-form');
  if (uploadForm) {
    uploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('pdf-name').value;
      const price = document.getElementById('pdf-price').value;
      const file = document.getElementById('pdf-file').files[0];
  
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('pdfFile', file);
  
      fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed');
          }
          throw new Error('Upload failed');
        }
        return response.json();
      })
      .then(data => {
        console.log('PDF uploaded:', data);
        fetchPdfs();
        uploadForm.reset();
      })
      .catch(error => {
        console.error('Error uploading PDF:', error);
        alert(error.message || 'Upload failed');
      });
    });
  }
  
  // Initiate payment
  function initiatePayment(pdfId) {
    localStorage.setItem('selectedPdfId', pdfId);
    window.location.href = 'https://rzp.io/rzp/hEoZCfjA';
  }
  
  // Verify payment (simulated) with countdown
  function verifyPayment() {
    const transactionId = document.getElementById('transaction-id').value;
    if (transactionId) {
      const popup = document.getElementById('popup');
      const countdownMessage = document.getElementById('countdown-message');
      popup.style.display = 'flex';
      let seconds = 3;
      countdownMessage.textContent = `Payment verified! Redirecting in ${seconds}...`;
      const countdown = setInterval(() => {
        seconds--;
        if (seconds > 0) {
          countdownMessage.textContent = `Payment verified! Redirecting in ${seconds}...`;
        } else {
          clearInterval(countdown);
          window.location.href = 'download.html';
        }
      }, 1000);
    } else {
      alert('Please enter a transaction ID');
    }
  }
  
  // Setup download with countdown
  function setupDownload() {
    const downloadBtn = document.getElementById('download-btn');
    const manualDownload = document.getElementById('manual-download');
    const popup = document.getElementById('download-popup');
    const countdownMessage = document.getElementById('download-countdown-message');
    const pdfId = localStorage.getItem('selectedPdfId');
  
    if (!downloadBtn || !manualDownload || !popup || !countdownMessage || !pdfId) return;
  
    fetch('/api/pdfs')
      .then(response => response.json())
      .then(pdfs => {
        const pdf = pdfs.find(p => p.id == pdfId);
        if (pdf) {
          const downloadUrl = pdf.filePath;
          downloadBtn.href = downloadUrl;
          downloadBtn.download = pdf.filePath.split('/').pop();
          manualDownload.href = downloadUrl;
          manualDownload.textContent = `Click here to download ${pdf.name}`;
  
          manualDownload.addEventListener('click', (e) => {
            e.preventDefault();
            popup.style.display = 'flex';
            let seconds = 3;
            countdownMessage.textContent = `Downloading... Redirecting in ${seconds}...`;
            downloadBtn.click();
            const countdown = setInterval(() => {
              seconds--;
              if (seconds > 0) {
                countdownMessage.textContent = `Downloading... Redirecting in ${seconds}...`;
              } else {
                clearInterval(countdown);
                window.location.href = 'index.html';
              }
            }, 1000);
          });
        }
      })
      .catch(error => console.error('Error fetching PDF details:', error));
  }
  
  // Load appropriate function based on page
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('pdf-list')) {
      fetchPdfs(); // For index.html
    } else if (document.getElementById('download-btn')) {
      setupDownload(); // For download.html
    }
  });