// Funjibly Extension - Content Script
console.log('Funjibly extension loaded');

const API_URL = 'https://funjibly-api.proudwater-3e7b001e.eastus.azurecontainerapps.io/api';

// Check if page has a paywall
function detectPaywall() {
  const hasPaywall = document.body.getAttribute('data-has-paywall') === 'true';
  let articleId = document.body.getAttribute('data-article-id');
  const articlePrice = document.body.getAttribute('data-article-price') || '1.50';

  // If no article ID, generate from URL
  if (!articleId) {
    articleId = generateArticleId(window.location.href);
  }

  if (hasPaywall && articleId) {
    console.log('Paywall detected!', { articleId, articlePrice });
    
    // Check if already purchased
    checkIfPurchased(articleId, articlePrice);
  }
}

// Generate consistent article ID from URL
function generateArticleId(url) {
  // Simple hash of URL - you could use a better hash function
  return btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 24);
}

// Check if article is already purchased
async function checkIfPurchased(articleId, price) {
  chrome.storage.local.get(['funjibly_token'], async (result) => {
    const token = result.funjibly_token;

    if (!token) {
      injectFunjiblyButton(articleId, price, false);
      return;
    }

    try {
      // Check purchased articles
      const response = await fetch(`${API_URL}/articles/purchased`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        const purchased = data.data.find(a => a._id === articleId);
        
        if (purchased) {
          // Already purchased - unlock immediately
          unlockContent();
          showAlreadyPurchasedMessage();
        } else {
          // Not purchased - show unlock button
          injectFunjiblyButton(articleId, price, false);
        }
      } else {
        injectFunjiblyButton(articleId, price, false);
      }
    } catch (error) {
      console.error('Error checking purchase:', error);
      injectFunjiblyButton(articleId, price, false);
    }
  });
}

// Show message for already purchased articles
function showAlreadyPurchasedMessage() {
  const paywall = document.getElementById('paywall');
  if (!paywall) return;

  const paywallContent = paywall.querySelector('.paywall-content');
  if (!paywallContent) return;

  paywallContent.innerHTML = `
    <h2>✅ Already Purchased</h2>
    <p>You've already unlocked this article. Enjoy reading!</p>
    <button onclick="this.parentElement.parentElement.style.display='none'; document.body.style.overflow='auto';" 
            style="background: #28a745; color: white; padding: 12px 30px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
      Continue Reading
    </button>
  `;
}

// Inject Funjibly unlock button into paywall
function injectFunjiblyButton(articleId, price, isPurchased) {
  const paywall = document.getElementById('paywall');
  if (!paywall) return;

  const paywallContent = paywall.querySelector('.paywall-content');
  if (!paywallContent) return;

  // Check if button already exists
  if (document.getElementById('funjibly-unlock')) return;

  // Create Funjibly button
  const button = document.createElement('button');
  button.id = 'funjibly-unlock';
  button.textContent = `🔓 Unlock with Funjibly for $${price}`;
  button.onclick = () => unlockArticle(articleId, price);

  paywallContent.appendChild(button);
  console.log('Funjibly button injected');
}

// Unlock article via Funjibly API
async function unlockArticle(articleId, price) {
  console.log('Unlocking article:', articleId);

  // Disable button to prevent double-clicks
  const unlockBtn = document.getElementById('funjibly-unlock');
  if (unlockBtn.disabled) return;
  unlockBtn.disabled = true;
  unlockBtn.textContent = 'Unlocking...';

  // Get auth token from storage
  chrome.storage.local.get(['funjibly_token'], async (result) => {
    const token = result.funjibly_token;

    if (!token) {
      alert('Please login to Funjibly first via the extension popup');
      unlockBtn.disabled = false;
      unlockBtn.textContent = `🔓 Unlock with Funjibly for $${price}`;
      return;
    }

    // Gather article metadata
    const metadata = {
      title: document.querySelector('h1')?.textContent || document.title,
      author: document.querySelector('[class*="author"]')?.textContent || 'Unknown',
      url: window.location.href,
      publisherUrl: window.location.origin
    };

    try {
      // Call Funjibly API to purchase article
      const response = await fetch(`${API_URL}/articles/${articleId}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ articleMetadata: metadata })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success! Unlock content
        unlockContent();
        alert('✅ Article unlocked! Enjoy reading.');
      } else {
        throw new Error(data.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Unlock error:', error);
      
      if (error.message.includes('already purchased')) {
        unlockContent();
        alert('You already own this article!');
      } else {
        alert(`Failed to unlock: ${error.message}`);
        unlockBtn.disabled = false;
        unlockBtn.textContent = `🔓 Unlock with Funjibly for $${price}`;
      }
    }
  });
}

// Unlock the content on the page
function unlockContent() {
  const paywall = document.getElementById('paywall');
  const premiumContent = document.getElementById('premium-content');

  if (paywall) {
    paywall.style.display = 'none';
    paywall.classList.remove('active');
  }
  if (premiumContent) {
    premiumContent.classList.remove('blurred');
    premiumContent.style.filter = 'none';
  }
  document.body.style.overflow = 'auto';
}

// Run detection when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', detectPaywall);
} else {
  detectPaywall();
}