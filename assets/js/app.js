let books = [];
let activeCategory = 'All';
let searchTerm = '';
let sortMode = 'featured';
let cart = JSON.parse(localStorage.getItem('famNoergaardCart') || '{}');

const $ = (s) => document.querySelector(s);
const categoryIcons = {
  'Fiction':'✦','Romance':'♡','Mystery & Thriller':'⌕','Fantasy':'♜',
  'Science Fiction':'◌','Classics':'❦','Business & Self Development':'↗',"Children's":'☀'
};
const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const coverUrl = isbn => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

async function init(){
  const res = await fetch('data/books.json');
  books = await res.json();
  renderCategories();
  renderFilters();
  renderBooks();
  renderCart();
}

function renderCategories(){
  const counts = books.reduce((a,b)=>(a[b.category]=(a[b.category]||0)+1,a),{});
  $('#categoryGrid').innerHTML = Object.entries(counts).map(([name,count])=>`
    <article class="category-card" data-category="${name}">
      <div class="category-icon">${categoryIcons[name]||'✦'}</div>
      <strong>${name}</strong><small>${count} books</small>
    </article>`).join('');
  document.querySelectorAll('.category-card').forEach(card=>card.addEventListener('click',()=>{
    activeCategory=card.dataset.category; renderFilters(); renderBooks(); location.hash='shop';
  }));
}

function renderFilters(){
  const cats=['All',...new Set(books.map(b=>b.category))];
  $('#filterChips').innerHTML=cats.map(c=>`<button class="filter-chip ${c===activeCategory?'active':''}" data-cat="${c}">${c}</button>`).join('');
  document.querySelectorAll('.filter-chip').forEach(btn=>btn.addEventListener('click',()=>{activeCategory=btn.dataset.cat;renderFilters();renderBooks();}));
}

function filteredBooks(){
  let list=books.filter(b=>(activeCategory==='All'||b.category===activeCategory) && `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(searchTerm.toLowerCase()));
  if(sortMode==='price-asc') list.sort((a,b)=>a.price-b.price);
  if(sortMode==='price-desc') list.sort((a,b)=>b.price-a.price);
  if(sortMode==='rating') list.sort((a,b)=>b.rating-a.rating);
  if(sortMode==='title') list.sort((a,b)=>a.title.localeCompare(b.title));
  return list;
}

function renderBooks(){
  const list=filteredBooks();
  $('#resultsCount').textContent=`${list.length} book${list.length===1?'':'s'}`;
  $('#bookGrid').innerHTML=list.map(b=>`
    <article class="book-card">
      <div class="cover-wrap">
        <span class="book-badge">${b.badge}</span>
        <img class="book-cover" src="${coverUrl(b.isbn)}" alt="${b.title} book cover" loading="lazy" onerror="this.dataset.error='true';this.style.display='none';this.nextElementSibling.style.display='grid'" />
        <div class="cover-fallback"><span>${b.title}</span></div>
        <button class="quick-view" data-view="${b.id}">Quick view</button>
      </div>
      <div class="book-info">
        <div class="book-meta"><div><h3>${b.title}</h3><p class="book-author">${b.author}</p></div><span class="book-rating">★ ${b.rating}</span></div>
        <div class="book-bottom"><span class="price">${money(b.price)}</span><button class="add-btn" data-add="${b.id}" aria-label="Add ${b.title} to bag">+</button></div>
      </div>
    </article>`).join('') || '<p>No books match your filters.</p>';
  document.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>addToCart(+b.dataset.add)));
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>openBook(+b.dataset.view)));
}

function addToCart(id){ cart[id]=(cart[id]||0)+1; saveCart(); toast('Added to your reading bag'); }
function saveCart(){ localStorage.setItem('famNoergaardCart',JSON.stringify(cart)); renderCart(); }
function cartQuantity(){ return Object.values(cart).reduce((a,b)=>a+b,0); }
function renderCart(){
  $('#cartCount').textContent=cartQuantity();
  const ids=Object.keys(cart).filter(id=>cart[id]>0);
  const items=ids.map(id=>books.find(b=>b.id===+id)).filter(Boolean);
  $('#cartItems').innerHTML=items.map(b=>`<div class="cart-item"><img src="${coverUrl(b.isbn)}" alt="${b.title}"><div><h4>${b.title}</h4><p>${money(b.price)} · ${b.format}</p><button class="remove" data-remove="${b.id}">Remove</button></div><div class="qty"><button data-dec="${b.id}">−</button><strong>${cart[b.id]}</strong><button data-inc="${b.id}">+</button></div></div>`).join('');
  $('#cartEmpty').style.display=items.length?'none':'block';
  $('.cart-summary').style.display=items.length?'block':'none';
  $('#cartTotal').textContent=money(items.reduce((sum,b)=>sum+b.price*cart[b.id],0));
  document.querySelectorAll('[data-inc]').forEach(x=>x.onclick=()=>{cart[x.dataset.inc]++;saveCart()});
  document.querySelectorAll('[data-dec]').forEach(x=>x.onclick=()=>{cart[x.dataset.dec]--;if(cart[x.dataset.dec]<=0)delete cart[x.dataset.dec];saveCart()});
  document.querySelectorAll('[data-remove]').forEach(x=>x.onclick=()=>{delete cart[x.dataset.remove];saveCart()});
}
function openCart(){ $('#cartDrawer').classList.add('open'); $('#overlay').classList.add('show'); $('#cartDrawer').setAttribute('aria-hidden','false'); }
function closeCart(){ $('#cartDrawer').classList.remove('open'); $('#overlay').classList.remove('show'); $('#cartDrawer').setAttribute('aria-hidden','true'); }
function openBook(id){
  const b=books.find(x=>x.id===id); if(!b)return;
  $('#dialogBody').innerHTML=`<div class="dialog-grid"><img class="dialog-cover" src="${coverUrl(b.isbn)}" alt="${b.title} cover"><div><p class="eyebrow">${b.category}</p><h2>${b.title}</h2><p class="book-author">by ${b.author}</p><div class="dialog-pills"><span>${b.format}</span><span>★ ${b.rating}</span><span>ISBN ${b.isbn}</span></div><p class="desc">${b.description}</p><div class="dialog-price">${money(b.price)}</div><button class="btn primary" id="dialogAdd">Add to bag</button><p class="book-author" style="margin-top:14px">Reference retail price in USD. Retail pricing and availability may change.</p></div></div>`;
  $('#bookDialog').showModal(); $('#dialogAdd').onclick=()=>{addToCart(id);$('#bookDialog').close();};
}
let toastTimer; function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2200)}

$('#searchInput').addEventListener('input',e=>{searchTerm=e.target.value;renderBooks()});
$('#sortSelect').addEventListener('change',e=>{sortMode=e.target.value;renderBooks()});
$('#clearFilters').addEventListener('click',()=>{activeCategory='All';searchTerm='';$('#searchInput').value='';sortMode='featured';$('#sortSelect').value='featured';renderFilters();renderBooks()});
$('#searchFocus').addEventListener('click',()=>{location.hash='shop';setTimeout(()=>$('#searchInput').focus(),250)});
$('#cartBtn').addEventListener('click',openCart); $('#closeCart').addEventListener('click',closeCart); $('#overlay').addEventListener('click',closeCart);
$('#dialogClose').addEventListener('click',()=>$('#bookDialog').close());
$('#menuBtn').addEventListener('click',()=>$('#nav').classList.toggle('open'));
document.querySelectorAll('#nav a').forEach(a=>a.addEventListener('click',()=>$('#nav').classList.remove('open')));
$('#checkoutBtn').addEventListener('click',()=>toast('Demo checkout — connect your payment provider before launch'));
$('#newsletterForm').addEventListener('submit',e=>{e.preventDefault();e.target.reset();toast('Thanks — you’re on the demo reading list!')});

init().catch(()=>{document.querySelector('#bookGrid').innerHTML='<p>Unable to load catalog. If you opened this page directly from your computer, run it through a local web server or upload it to GitHub Pages.</p>'});
