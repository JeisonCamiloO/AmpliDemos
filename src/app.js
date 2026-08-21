import { ampli } from './ampli';

(function(){
  "use strict";

  var PRODUCTS = [
    {id:'azitro',name:'Azitromicina',linea:'Antibiótica',color:'#7e71aa',desc:'Un nuevo concepto en antibioticoterapia',price:22400,img:'assets/img/pack-azitromicina-global72dpiRGB.jpg'},
    {id:'protech-perro',name:'Protech Perros',linea:'Antiparasitaria',color:'#57c4cb',desc:'La evolución de la pipeta',price:15800,img:'assets/img/Protech-Perros-ARG.png'},
    {id:'protech-gato',name:'Protech Gatos',linea:'Antiparasitaria',color:'#57c4cb',desc:'Protege tu gato y tu hogar',price:14200,img:'assets/img/Protech-Gatos-Packs.png'},
    {id:'fipro',name:'Fipro',linea:'Antiparasitaria',color:'#57c4cb',desc:'Tratamiento y prevención de pulgas y garrapatas',price:11900,img:'assets/img/Fipro-Arg.jpg'},
    {id:'otiflex-c',name:'Otiflex C',linea:'Dermatológica',color:'#fcb833',desc:'El tratamiento exitoso de la otitis es posible',price:9800,img:'assets/img/pack-otiflex-c-global72dpiWEB.jpg'},
    {id:'labyderm-nutri',name:'Labyderm Nutrición Profunda',linea:'Dermatológica',color:'#fcb833',desc:'Promueve la integridad de la barrera cutánea',price:13500,img:'assets/img/Labyderm-nutricion-profunda.png'},
    {id:'aerosol-6a',name:'Aerosol 6A',linea:'Dermatológica',color:'#fcb833',desc:'1 aplicación, 6 acciones',price:8600,img:'assets/img/pack-aerosol-6a.png'},
    {id:'gerioox',name:'Gerioox',linea:'Senior',color:'#f58a1f',desc:'Parece mágico, pero es científico',price:19200,img:'assets/img/gerioox_arg_chile_x30_2018_con_foto_web.jpg'},
    {id:'trihepat',name:'Trihepat',linea:'Digestiva',color:'#83c88a',desc:'La solución más natural para un hígado sano',price:17300,img:'assets/img/labyes-trihepat_2020ARG_FrascoBlanco.jpg'},
    {id:'tau-oft',name:'Tau Oftálmico',linea:'Oftálmica',color:'#0e6a99',desc:'Solución en profundidad para conjuntivitis',price:10400,img:'assets/img/pack-tau-se-global72dpiRGB.jpg'},
    {id:'tobramax',name:'Tobramax',linea:'Oftálmica',color:'#0e6a99',desc:'Colirio de primera elección para úlceras',price:12100,img:'assets/img/pack-tobramax-global72dpiRGB.jpg'},
    {id:'osteocart',name:'Osteocart Plus',linea:'Osteoarticular',color:'#329883',desc:'Alivio del dolor osteoarticular',price:21700,img:'assets/img/osteocart_esp_x30_300dpi_logo2019ARG_web.jpg'},
  ];
  var LINEAS = ['Antibiótica','Antiparasitaria','Dermatológica','Senior','Digestiva','Oftálmica','Osteoarticular'];
  var PROVINCIAS = ['Buenos Aires','CABA','Córdoba','Santa Fe','Mendoza','Tucumán','Entre Ríos','Salta','Misiones','Chaco','Corrientes','Santiago del Estero','San Juan','Río Negro','Neuquén','Chubut'];
  var DISTRIBUIDORES = [
    {id:'centro',name:'Distribuidora Centro S.A.',zona:'CABA y GBA Norte'},
    {id:'sur',name:'VetSur Distribución',zona:'GBA Sur y La Plata'},
    {id:'cuyo',name:'AgroVet Cuyo',zona:'Mendoza y San Juan'},
  ];
  var money = function(n){ return '$' + Math.round(n).toLocaleString('es-AR'); };
  var MIN_ORDER = 120000;
  var CREDIT_LIMIT = 900000;
  var CREDIT_USED = 540000;

  var state = {
    screen: 'login', authIsLogin: true,
    signup: { nombre:'', email:'', password:'' }, showSignupAlert: false,
    onboardStep: 1, onboardPhase: 'form',
    form: { matricula:'', provincia:'', cuit:'', condicionIva:'', distribuidorId:'', distribuidorNombre:'', docName:'' },
    accountStatus: 'none',
    search:'', activeLinea:'',
    cart: {},
    paymentMethod:'', invoiceType:'B',
    orderStatus:'', orderNumber:'', orderTotal:0,
    selectedProductId:null, viewCounts:{}, addCounts:{},
    orders: [
      {id:'o1', number:'B2B-24081-0177', date:'02 Ago 2026', items:['Otiflex C x4'], total:39200, status:'delivered'},
      {id:'o2', number:'B2B-24081-0184', date:'07 Ago 2026', items:['Protech Perros x6'], total:94800, status:'in_transit'},
    ],
  };

  function esc(v){
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function dis(cond){ return cond ? 'disabled' : ''; }

  var app = document.getElementById('app');

  var isRendering = false;
  var renderPending = false;

  function render(){
    // Replacing innerHTML while an input is focused fires a native 'blur'
    // (and 'change') on it synchronously, which can re-enter render() from
    // inside the DOM removal that's still in progress. Queue instead of
    // nesting the innerHTML write.
    if (isRendering) { renderPending = true; return; }
    isRendering = true;
    performRender();
    isRendering = false;
    if (renderPending) {
      renderPending = false;
      render();
    }
  }

  function performRender(){
    var active = document.activeElement;
    var focusId = active && active.id ? active.id : null;
    var selStart = active && 'selectionStart' in active ? active.selectionStart : null;
    var selEnd = active && 'selectionEnd' in active ? active.selectionEnd : null;

    app.innerHTML = renderScreen();

    if (focusId) {
      var el = document.getElementById(focusId);
      if (el) {
        el.focus();
        if (selStart != null && 'setSelectionRange' in el) {
          try { el.setSelectionRange(selStart, selEnd); } catch(e) {}
        }
      }
    }
  }

  function renderScreen(){
    var screenHtml = '';
    if (state.screen === 'login') screenHtml = renderLogin();
    else if (state.screen === 'onboarding') screenHtml = renderOnboarding();
    else if (state.screen === 'dashboard') screenHtml = renderDashboard();
    else if (state.screen === 'checkout') screenHtml = renderCheckout();
    else if (state.screen === 'confirmation') screenHtml = renderConfirmation();
    else if (state.screen === 'tracking') screenHtml = renderTracking();
    return '<div style="min-height:100vh">' + screenHtml + '</div>' + renderProductModal() + renderSignupAlert();
  }

  function renderHeader(includeSearch){
    var s = state;
    var accApproved = s.accountStatus === 'approved';
    var accountPillStyle = accApproved ? 'background:#eef8ec;color:#3f7a34' : (s.accountStatus==='pending' ? 'background:#fdf6e8;color:#8a6b2f' : 'background:#ededed;color:#808080');
    var accountPillText = accApproved ? 'Cuenta aprobada' : (s.accountStatus==='pending' ? 'Pendiente de aprobación' : 'Sin habilitar');
    var cartCount = 0;
    Object.keys(s.cart).forEach(function(id){ if (s.cart[id] > 0) cartCount += s.cart[id]; });
    return '' +
    '<div style="background:#fff;border-bottom:1px solid #dbdcdd;padding:14px 32px;display:flex;align-items:center;gap:22px;position:sticky;top:0;z-index:10">' +
      '<div data-action="go" data-arg="dashboard" style="font-size:18px;font-weight:900;letter-spacing:-.01em;color:#ef3b23;white-space:nowrap;cursor:pointer">Minders<span style="font-weight:400;color:#232323">Vet</span></div>' +
      (includeSearch ? '<input id="input-search" data-action="setSearch" value="' + esc(s.search) + '" type="text" placeholder="Buscar producto..." style="flex:1;max-width:380px;padding:9px 13px;border:1px solid #dbdcdd;border-radius:var(--radius-sm);font-size:13.5px"/>' : '') +
      '<div style="flex:1"></div>' +
      '<div style="font-size:12.5px;font-weight:700;padding:6px 12px;border-radius:var(--radius-pill);' + accountPillStyle + '">' + accountPillText + '</div>' +
      '<button data-action="go" data-arg="tracking" style="background:none;border:1px solid #dbdcdd;color:#585858;border-radius:var(--radius-sm);padding:9px 14px;font-size:13.5px;font-weight:700;cursor:pointer;white-space:nowrap">Mis pedidos</button>' +
      '<button data-action="go" data-arg="checkout" style="position:relative;background:#232323;color:#fff;border:none;border-radius:var(--radius-sm);padding:9px 16px;font-size:13.5px;font-weight:700;cursor:pointer">Ver pedido (' + cartCount + ')</button>' +
      '<button data-action="logout" style="background:none;border:1px solid #dbdcdd;color:#585858;border-radius:var(--radius-sm);padding:9px 14px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap">Cerrar sesión</button>' +
    '</div>';
  }

  function renderLogin(){
    var s = state;
    var loginTabStyle = s.authIsLogin ? 'color:#ef3b23;border-bottom:2px solid #ef3b23;padding-bottom:14px' : 'color:#a3a3a3';
    var signupTabStyle = !s.authIsLogin ? 'color:#ef3b23;border-bottom:2px solid #ef3b23;padding-bottom:14px' : 'color:#a3a3a3';
    var body = s.authIsLogin ? (
      '<div style="display:flex;flex-direction:column;gap:16px">' +
        '<label style="font-size:13px;font-weight:600;color:#585858">Email o N° de matrícula' +
          '<input type="text" placeholder="dra.gonzalez@vetclinica.com.ar" style="display:block;width:100%;margin-top:6px;padding:11px 13px;border:1px solid #dbdcdd;border-radius:var(--radius-sm);font-size:14px;box-sizing:border-box"/>' +
        '</label>' +
        '<label style="font-size:13px;font-weight:600;color:#585858">Contraseña' +
          '<input type="password" placeholder="••••••••" style="display:block;width:100%;margin-top:6px;padding:11px 13px;border:1px solid #dbdcdd;border-radius:var(--radius-sm);font-size:14px;box-sizing:border-box"/>' +
        '</label>' +
        '<a href="#" data-action="stopProp" style="font-size:12.5px;align-self:flex-end;margin-top:-8px">Olvidé mi contraseña</a>' +
        '<button data-action="loginExisting" class="btn-primary" style="margin-top:6px;background:#ef3b23;color:#fff;border:none;border-radius:var(--radius-sm);padding:13px;font-size:14.5px;font-weight:700;text-transform:uppercase;letter-spacing:.02em;cursor:pointer">Ingresar</button>' +
        '<p style="font-size:13px;color:#808080;text-align:center;margin:14px 0 0">¿No tenés cuenta? <a href="#" data-action="setAuthSignup">Creá una ahora</a></p>' +
      '</div>'
    ) : (
      '<div style="display:flex;flex-direction:column;gap:16px">' +
        '<label style="font-size:13px;font-weight:600;color:#585858">Nombre completo' +
          '<input id="input-signup-nombre" data-action="setSignupNombre" value="' + esc(s.signup.nombre) + '" type="text" placeholder="Dra. Marina González" style="display:block;width:100%;margin-top:6px;padding:11px 13px;border:1px solid #dbdcdd;border-radius:var(--radius-sm);font-size:14px;box-sizing:border-box"/>' +
        '</label>' +
        '<label style="font-size:13px;font-weight:600;color:#585858">Email profesional' +
          '<input id="input-signup-email" data-action="setSignupEmail" value="' + esc(s.signup.email) + '" type="text" placeholder="dra.gonzalez@vetclinica.com.ar" style="display:block;width:100%;margin-top:6px;padding:11px 13px;border:1px solid #dbdcdd;border-radius:var(--radius-sm);font-size:14px;box-sizing:border-box"/>' +
        '</label>' +
        '<label style="font-size:13px;font-weight:600;color:#585858">Contraseña' +
          '<input id="input-signup-password" data-action="setSignupPassword" value="' + esc(s.signup.password) + '" type="password" placeholder="Mínimo 8 caracteres" style="display:block;width:100%;margin-top:6px;padding:11px 13px;border:1px solid #dbdcdd;border-radius:var(--radius-sm);font-size:14px;box-sizing:border-box"/>' +
        '</label>' +
        '<button data-action="submitSignup" class="btn-primary" style="margin-top:6px;background:#ef3b23;color:#fff;border:none;border-radius:var(--radius-sm);padding:13px;font-size:14.5px;font-weight:700;text-transform:uppercase;letter-spacing:.02em;cursor:pointer">Crear cuenta</button>' +
        '<p style="font-size:12px;color:#a3a3a3;text-align:center;margin:8px 0 0">Vas a completar tu habilitación comercial en el siguiente paso.</p>' +
      '</div>'
    );
    return '' +
    '<div style="display:grid;grid-template-columns:420px 1fr;min-height:100vh">' +
      '<div style="background:#ef3b23;background-image:radial-gradient(circle at 20% 20%, rgba(255,255,255,.08) 0, transparent 45%);display:flex;flex-direction:column;justify-content:space-between;padding:56px 44px;color:#fff">' +
        '<div>' +
          '<div style="font-size:22px;font-weight:900;letter-spacing:-.01em;color:#fff">Minders<span style="font-weight:400">Vet</span></div>' +
          '<div style="margin-top:70px;font-size:34px;font-weight:900;line-height:1.15">Portal B2B<br/>para Veterinarias</div>' +
          '<p style="font-size:15.5px;line-height:1.6;opacity:.92;margin-top:18px;max-width:320px">Pedidos a tu distribuidor zonal, precios mayoristas y reposición rápida, todo en un solo lugar.</p>' +
        '</div>' +
        '<p style="font-size:12px;opacity:.7;margin:0">© 2026 MindersVet — Argentina</p>' +
      '</div>' +
      '<div style="display:flex;align-items:center;justify-content:center;padding:40px">' +
        '<div style="width:100%;max-width:380px">' +
          '<div style="display:flex;gap:26px;border-bottom:1px solid #dbdcdd;margin-bottom:32px">' +
            '<button data-action="setAuthLogin" class="tab-link" style="border:none;background:none;cursor:pointer;padding:0 0 14px;font-size:15px;font-weight:700">' +
              '<span style="' + loginTabStyle + '">Iniciar sesión</span>' +
            '</button>' +
            '<button data-action="setAuthSignup" class="tab-link" style="border:none;background:none;cursor:pointer;padding:0 0 14px;font-size:15px;font-weight:700">' +
              '<span style="' + signupTabStyle + '">Crear cuenta nueva</span>' +
            '</button>' +
          '</div>' +
          body +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderOnboarding(){
    var s = state;
    var cuitOk = /^\d{2}-?\d{8}-?\d$/.test(s.form.cuit.trim());
    var onboardIsForm = s.onboardPhase === 'form';
    var onboardIsPending = s.onboardPhase === 'pending' && s.accountStatus === 'pending';
    var onboardIsApproved = s.onboardPhase === 'pending' && s.accountStatus === 'approved';
    var step1Invalid = !(s.form.matricula && s.form.provincia);
    var step2Invalid = !(cuitOk && s.form.condicionIva);
    var step3Invalid = !s.form.distribuidorId;
    var step4Invalid = !s.form.docName;
    var cuitHintText = s.form.cuit ? (cuitOk ? 'Dígito verificador válido' : 'Formato esperado: 30-71234567-9') : ' ';
    var cuitHintStyle = s.form.cuit && cuitOk ? 'color:#3f7a34' : 'color:#a3a3a3';
    var onboardingLogoStyle = s.accountStatus === 'approved' ? 'cursor:pointer' : 'cursor:default';

    var stepDotsHtml = [1,2,3,4,5].map(function(n){
      return '<div style="height:4px;flex:1;border-radius:3px;background:' + (n<=s.onboardStep ? '#ef3b23' : '#ededed') + '"></div>';
    }).join('');

    var ivaOptionsHtml = ['Responsable Inscripto','Monotributista','Exento'].map(function(label){
      var sel = s.form.condicionIva===label;
      return '<button data-action="selectIva" data-arg="' + esc(label) + '" style="flex:1;border-radius:var(--radius);padding:14px 10px;font-size:13px;font-weight:600;cursor:pointer;text-align:center;' + (sel ? 'border:2px solid #ef3b23;background:#fdeeec;color:#c9171e' : 'border:1px solid #dbdcdd;background:#fff;color:#585858') + '">' + esc(label) + '</button>';
    }).join('');

    var distribuidoresHtml = DISTRIBUIDORES.map(function(d){
      var sel = s.form.distribuidorId===d.id;
      return '<button data-action="selectDistribuidor" data-arg="' + d.id + '" style="display:flex;justify-content:space-between;align-items:center;text-align:left;border-radius:var(--radius);padding:14px 16px;cursor:pointer;' + (sel ? 'border:2px solid #ef3b23;background:#fdeeec' : 'border:1px solid #dbdcdd;background:#fff') + '">' +
        '<span><span style="display:block;font-weight:700;font-size:14px">' + esc(d.name) + '</span><span style="display:block;font-size:12.5px;color:#808080;margin-top:2px">' + esc(d.zona) + '</span></span>' +
        (sel ? '<span style="color:#ef3b23;font-weight:900;font-size:16px">✓</span>' : '') +
      '</button>';
    }).join('');

    var provinciasHtml = PROVINCIAS.map(function(p){
      return '<option value="' + esc(p) + '" ' + (s.form.provincia===p?'selected':'') + '>' + esc(p) + '</option>';
    }).join('');

    var step1 = '' +
      '<div style="background:#fff;border:1px solid #dbdcdd;border-radius:var(--radius);padding:32px">' +
        '<div style="font-size:12px;font-weight:700;color:#ef3b23;text-transform:uppercase;letter-spacing:.05em;margin-bottom:16px">Paso 1 de 5 · Matrícula profesional</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">' +
          '<label style="font-size:13px;font-weight:600;grid-column:1/-1">N° de matrícula profesional' +
            '<input id="input-matricula" data-action="setMatricula" value="' + esc(s.form.matricula) + '" type="text" placeholder="MP-24581" style="display:block;width:100%;margin-top:6px;padding:11px 13px;border:1px solid #dbdcdd;border-radius:var(--radius-sm);font-size:14px;box-sizing:border-box"/>' +
          '</label>' +
          '<label style="font-size:13px;font-weight:600;grid-column:1/-1">Provincia de matrícula' +
            '<select id="input-provincia" data-action="setProvincia" style="display:block;width:100%;margin-top:6px;padding:11px 13px;border:1px solid #dbdcdd;border-radius:var(--radius-sm);font-size:14px;box-sizing:border-box;background:#fff">' +
              '<option value="">Seleccioná una provincia</option>' + provinciasHtml +
            '</select>' +
          '</label>' +
        '</div>' +
        '<div style="display:flex;justify-content:flex-end;margin-top:26px">' +
          '<button data-action="goStep" data-arg="2" class="btn-primary" ' + dis(step1Invalid) + ' style="background:#ef3b23;color:#fff;border:none;border-radius:var(--radius-sm);padding:12px 26px;font-size:14px;font-weight:700;cursor:pointer">Continuar →</button>' +
        '</div>' +
      '</div>';

    var step2 = '' +
      '<div style="background:#fff;border:1px solid #dbdcdd;border-radius:var(--radius);padding:32px">' +
        '<div style="font-size:12px;font-weight:700;color:#ef3b23;text-transform:uppercase;letter-spacing:.05em;margin-bottom:16px">Paso 2 de 5 · Datos fiscales</div>' +
        '<label style="font-size:13px;font-weight:600">CUIT' +
          '<input id="input-cuit" data-action="setCuit" value="' + esc(s.form.cuit) + '" type="text" placeholder="30-71234567-9" style="display:block;width:100%;margin-top:6px;padding:11px 13px;border:1px solid #dbdcdd;border-radius:var(--radius-sm);font-size:14px;box-sizing:border-box"/>' +
        '</label>' +
        '<p style="font-size:12.5px;margin:8px 0 0;' + cuitHintStyle + '">' + esc(cuitHintText) + '</p>' +
        '<div style="margin-top:24px;font-size:13px;font-weight:600">Condición frente al IVA</div>' +
        '<div style="display:flex;gap:10px;margin-top:10px">' + ivaOptionsHtml + '</div>' +
        '<div style="display:flex;justify-content:space-between;margin-top:28px">' +
          '<button data-action="goStep" data-arg="1" style="background:none;border:1px solid #dbdcdd;color:#585858;border-radius:var(--radius-sm);padding:12px 22px;font-size:14px;font-weight:700;cursor:pointer">← Atrás</button>' +
          '<button data-action="goStep" data-arg="3" class="btn-primary" ' + dis(step2Invalid) + ' style="background:#ef3b23;color:#fff;border:none;border-radius:var(--radius-sm);padding:12px 26px;font-size:14px;font-weight:700;cursor:pointer">Continuar →</button>' +
        '</div>' +
      '</div>';

    var step3 = '' +
      '<div style="background:#fff;border:1px solid #dbdcdd;border-radius:var(--radius);padding:32px">' +
        '<div style="font-size:12px;font-weight:700;color:#ef3b23;text-transform:uppercase;letter-spacing:.05em;margin-bottom:16px">Paso 3 de 5 · Distribuidor zonal</div>' +
        '<p style="font-size:13.5px;color:#808080;margin:0 0 16px">Elegí el distribuidor que va a gestionar tu crédito comercial, stock y entregas.</p>' +
        '<div style="display:flex;flex-direction:column;gap:10px">' + distribuidoresHtml + '</div>' +
        '<div style="display:flex;justify-content:space-between;margin-top:28px">' +
          '<button data-action="goStep" data-arg="2" style="background:none;border:1px solid #dbdcdd;color:#585858;border-radius:var(--radius-sm);padding:12px 22px;font-size:14px;font-weight:700;cursor:pointer">← Atrás</button>' +
          '<button data-action="goStep" data-arg="4" class="btn-primary" ' + dis(step3Invalid) + ' style="background:#ef3b23;color:#fff;border:none;border-radius:var(--radius-sm);padding:12px 26px;font-size:14px;font-weight:700;cursor:pointer">Continuar →</button>' +
        '</div>' +
      '</div>';

    var step4 = '' +
      '<div style="background:#fff;border:1px solid #dbdcdd;border-radius:var(--radius);padding:32px">' +
        '<div style="font-size:12px;font-weight:700;color:#ef3b23;text-transform:uppercase;letter-spacing:.05em;margin-bottom:16px">Paso 4 de 5 · Documentación</div>' +
        '<p style="font-size:13.5px;color:#808080;margin:0 0 16px">Adjuntá un documento que respalde los datos ingresados (matrícula profesional o habilitación sanitaria). Tu distribuidor lo va a validar antes de habilitar el catálogo.</p>' +
        '<label style="font-size:13px;font-weight:600">Documento de respaldo' +
          '<input id="input-doc" data-action="setDoc" type="file" accept=".pdf,.jpg,.jpeg,.png" style="display:block;width:100%;margin-top:6px;padding:11px 13px;border:1px solid #dbdcdd;border-radius:var(--radius-sm);font-size:14px;box-sizing:border-box;background:#fff"/>' +
        '</label>' +
        (s.form.docName ? '<p style="font-size:12.5px;color:#3f7a34;margin:10px 0 0">✓ Archivo adjuntado: ' + esc(s.form.docName) + '</p>' : '') +
        '<div style="display:flex;justify-content:space-between;margin-top:28px">' +
          '<button data-action="goStep" data-arg="3" style="background:none;border:1px solid #dbdcdd;color:#585858;border-radius:var(--radius-sm);padding:12px 22px;font-size:14px;font-weight:700;cursor:pointer">← Atrás</button>' +
          '<button data-action="goStep" data-arg="5" class="btn-primary" ' + dis(step4Invalid) + ' style="background:#ef3b23;color:#fff;border:none;border-radius:var(--radius-sm);padding:12px 26px;font-size:14px;font-weight:700;cursor:pointer">Revisar →</button>' +
        '</div>' +
      '</div>';

    var step5 = '' +
      '<div style="background:#fff;border:1px solid #dbdcdd;border-radius:var(--radius);padding:32px">' +
        '<div style="font-size:12px;font-weight:700;color:#ef3b23;text-transform:uppercase;letter-spacing:.05em;margin-bottom:16px">Paso 5 de 5 · Revisión</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 24px;font-size:14px">' +
          '<div><span style="color:#a3a3a3;font-size:12px;display:block">Matrícula</span>' + esc(s.form.matricula) + ' — ' + esc(s.form.provincia) + '</div>' +
          '<div><span style="color:#a3a3a3;font-size:12px;display:block">CUIT</span>' + esc(s.form.cuit) + '</div>' +
          '<div><span style="color:#a3a3a3;font-size:12px;display:block">Condición IVA</span>' + esc(s.form.condicionIva) + '</div>' +
          '<div><span style="color:#a3a3a3;font-size:12px;display:block">Distribuidor</span>' + esc(s.form.distribuidorNombre) + '</div>' +
          '<div><span style="color:#a3a3a3;font-size:12px;display:block">Documento adjunto</span>' + esc(s.form.docName) + '</div>' +
        '</div>' +
        '<div style="background:#f8f4ee;border:1px solid #f0e2cc;border-radius:var(--radius);padding:14px 16px;margin-top:24px;font-size:13px;color:#8a6b2f">Al confirmar, tu distribuidor zonal va a validar tu documentación y realizar un análisis de crédito comercial antes de habilitar precios y checkout.</div>' +
        '<div style="display:flex;justify-content:space-between;margin-top:24px">' +
          '<button data-action="goStep" data-arg="4" style="background:none;border:1px solid #dbdcdd;color:#585858;border-radius:var(--radius-sm);padding:12px 22px;font-size:14px;font-weight:700;cursor:pointer">← Atrás</button>' +
          '<button data-action="submitOnboarding" class="btn-primary" style="background:#ef3b23;color:#fff;border:none;border-radius:var(--radius-sm);padding:12px 26px;font-size:14px;font-weight:700;cursor:pointer">Confirmar y enviar</button>' +
        '</div>' +
      '</div>';

    var formSection = onboardIsForm ? (
      '<div style="display:flex;gap:8px;margin-bottom:30px">' + stepDotsHtml + '</div>' +
      (s.onboardStep===1 ? step1 : '') +
      (s.onboardStep===2 ? step2 : '') +
      (s.onboardStep===3 ? step3 : '') +
      (s.onboardStep===4 ? step4 : '') +
      (s.onboardStep===5 ? step5 : '')
    ) : '';

    var pendingSection = onboardIsPending ? (
      '<div style="background:#fff;border:1px dashed #d6c48f;border-radius:var(--radius);padding:44px;text-align:center">' +
        '<div style="width:56px;height:56px;border-radius:50%;background:#faf1dd;color:#c8901f;font-size:26px;font-weight:900;display:flex;align-items:center;justify-content:center;margin:0 auto 18px">⏳</div>' +
        '<div style="font-size:19px;font-weight:800;color:#232323">Cuenta pendiente de aprobación</div>' +
        '<p style="font-size:14px;color:#808080;max-width:420px;margin:12px auto 0;line-height:1.6">' + esc(s.form.distribuidorNombre) + ' está validando tu documentación y tu línea de crédito comercial. El catálogo se habilita una vez que la información quede aprobada — vas a recibir un email cuando eso pase, normalmente en menos de 24hs.</p>' +
        '<div style="margin-top:22px;padding-top:18px;border-top:1px solid #ededed">' +
          '<button data-action="approveAccount" style="background:none;border:none;color:#a3a3a3;font-size:12px;cursor:pointer;text-decoration:underline">(demo) simular aprobación del distribuidor →</button>' +
        '</div>' +
      '</div>'
    ) : '';

    var approvedSection = onboardIsApproved ? (
      '<div style="background:#fff;border:1px solid #cfe9c8;border-radius:var(--radius);padding:44px;text-align:center">' +
        '<div style="width:56px;height:56px;border-radius:50%;background:#eef8ec;color:#3f7a34;font-size:26px;font-weight:900;display:flex;align-items:center;justify-content:center;margin:0 auto 18px">✓</div>' +
        '<div style="font-size:19px;font-weight:800;color:#232323">¡Cuenta aprobada!</div>' +
        '<p style="font-size:14px;color:#808080;max-width:420px;margin:12px auto 0;line-height:1.6">' + esc(s.form.distribuidorNombre) + ' aprobó tu línea de crédito comercial. Ya podés ver precios mayoristas y hacer pedidos.</p>' +
        '<button data-action="goDashboardBrowsing" style="margin-top:24px;background:#ef3b23;color:#fff;border:none;border-radius:var(--radius-sm);padding:12px 22px;font-size:14px;font-weight:700;cursor:pointer">Ir al Dashboard →</button>' +
      '</div>'
    ) : '';

    return '' +
    '<div style="max-width:760px;margin:0 auto;padding:52px 24px 80px">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
        '<div data-action="onboardingLogoGo" style="font-size:18px;font-weight:900;letter-spacing:-.01em;color:#ef3b23;' + onboardingLogoStyle + '">Minders<span style="font-weight:400;color:#232323">Vet</span></div>' +
      '</div>' +
      '<h1 style="font-size:26px;font-weight:900;color:#232323;margin:22px 0 6px">Habilitación comercial</h1>' +
      '<p style="font-size:14.5px;color:#808080;margin:0 0 30px">Necesitamos estos datos para asignarte un distribuidor zonal y habilitar precios mayoristas.</p>' +
      formSection + pendingSection + approvedSection +
    '</div>';
  }

  function renderDashboard(){
    var s = state;
    var accApproved = s.accountStatus === 'approved';

    var filtered = PRODUCTS.filter(function(p){
      return (!s.activeLinea || p.linea===s.activeLinea) && (!s.search || p.name.toLowerCase().indexOf(s.search.toLowerCase()) !== -1);
    });
    var catalogHtml = filtered.map(function(p){
      return '' +
      '<div style="border:1px solid ' + p.color + ';border-radius:var(--radius);padding:var(--card-pad);background:#fff;display:flex;flex-direction:column">' +
        '<div data-action="openProduct" data-arg="' + p.id + '" style="cursor:pointer">' +
          '<span style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:' + p.color + '">' + esc(p.linea) + '</span>' +
          '<img src="' + p.img + '" style="width:100%;height:110px;object-fit:contain;margin:10px 0"/>' +
          '<div style="font-size:14.5px;font-weight:800;color:#232323">' + esc(p.name) + '</div>' +
          '<div style="font-size:12px;color:#808080;margin-top:3px;line-height:1.4">' + esc(p.desc) + '</div>' +
          '<div style="margin-top:10px;' + (accApproved ? '' : 'filter:blur(3px);opacity:.5') + '">' +
            '<div style="font-size:16px;font-weight:900;color:#232323">' + (accApproved ? money(p.price) : '—') + '</div>' +
            '<div style="font-size:11px;color:#a3a3a3">' + (accApproved ? '6+: 5% off · 12+: 10% off' : 'Disponible tras aprobación') + '</div>' +
          '</div>' +
        '</div>' +
        '<button data-action="addToCart" data-arg="' + p.id + '" ' + dis(!accApproved) + ' style="margin-top:12px;background:' + p.color + ';color:#fff;border:none;border-radius:var(--radius-sm);padding:9px;font-size:12.5px;font-weight:700;cursor:pointer">' + (accApproved ? 'Agregar al pedido' : 'Requiere aprobación') + '</button>' +
      '</div>';
    }).join('');

    var quickReorderDefs = [
      {id:'otiflex-c', days:34, qty:2},
      {id:'protech-perro', days:58, qty:3},
      {id:'osteocart', days:21, qty:1},
    ];
    var quickReorderHtml = quickReorderDefs.map(function(q){
      var p = PRODUCTS.filter(function(x){ return x.id===q.id; })[0];
      return '' +
      '<div style="border:1px solid #ededed;border-radius:var(--radius);padding:14px;display:flex;gap:12px;align-items:center;' + (accApproved ? '' : 'opacity:.5') + '">' +
        '<img src="' + p.img + '" style="width:44px;height:44px;object-fit:contain"/>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:13px;font-weight:700;color:#232323;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(p.name) + '</div>' +
          '<div style="font-size:11.5px;color:#a3a3a3">Última compra: hace ' + q.days + ' días</div>' +
          '<button data-action="addToCart" data-arg="' + q.id + '" data-qty="' + q.qty + '" ' + dis(!accApproved) + ' style="margin-top:6px;font-size:11.5px;font-weight:700;color:#fff;background:#ef3b23;border:none;border-radius:var(--radius-sm);padding:5px 10px;cursor:pointer">+ ' + q.qty + ' unid.</button>' +
        '</div>' +
      '</div>';
    }).join('');

    var heroBanners = [
      {linea:'Dermatológica', headline:'Cuidado de la piel, todo el año', color:'#fcb833'},
      {linea:'Senior', headline:'Geriatría con respaldo científico', color:'#f58a1f'},
      {linea:'Antiparasitaria', headline:'Protección externa e interna', color:'#57c4cb'},
    ];
    var heroBannersHtml = heroBanners.map(function(b){
      return '<button data-action="setActiveLinea" data-arg="' + esc(b.linea) + '" style="text-align:left;border:none;cursor:pointer;border-radius:var(--radius);padding:22px;color:#fff;background:' + b.color + ';min-height:108px;display:flex;flex-direction:column;justify-content:space-between">' +
        '<span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;opacity:.85">Línea ' + esc(b.linea) + '</span>' +
        '<span style="font-size:16.5px;font-weight:800">' + esc(b.headline) + '</span>' +
      '</button>';
    }).join('');

    var lineaChips = [{label:'Todas las líneas', linea:''}].concat(LINEAS.map(function(l){ return {label:l, linea:l}; }));
    var lineaChipsHtml = lineaChips.map(function(c){
      var active = s.activeLinea===c.linea;
      return '<button data-action="setActiveLinea" data-arg="' + esc(c.linea) + '" style="border-radius:var(--radius-pill);padding:7px 15px;font-size:12.5px;font-weight:700;cursor:pointer;' + (active ? 'background:#232323;color:#fff' : 'background:#ededed;color:#585858') + '">' + esc(c.label) + '</button>';
    }).join('');

    var pendingBanner = s.accountStatus === 'pending' ? (
      '<div style="background:#fdf6e8;border-bottom:1px solid #f0e2cc;padding:12px 32px;font-size:13px;color:#8a6b2f;display:flex;justify-content:space-between;align-items:center">' +
        '<span>Cuenta pendiente de aprobación de crédito — podés explorar el catálogo; el checkout se habilita cuando tu distribuidor te apruebe.</span>' +
        '<button data-action="approveAccount" style="background:none;border:none;color:#8a6b2f;font-size:12px;cursor:pointer;text-decoration:underline;white-space:nowrap;margin-left:14px">(demo) aprobar ahora →</button>' +
      '</div>'
    ) : '';

    return '' +
    '<div>' +
      renderHeader(true) +
      pendingBanner +
      '<div style="max-width:1240px;margin:0 auto;padding:28px 32px 70px">' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:34px">' + heroBannersHtml + '</div>' +
        '<div style="background:#fff;border:1px solid #dbdcdd;border-radius:var(--radius);padding:24px;margin-bottom:34px">' +
          '<div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px">' +
            '<h2 style="font-size:16px;font-weight:800;color:#232323;margin:0">Reposición rápida</h2>' +
            '<span style="font-size:12px;color:#a3a3a3">Basado en tu historial de compra</span>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">' + quickReorderHtml + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">' + lineaChipsHtml + '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(var(--grid-cols),1fr);gap:var(--gap)">' + catalogHtml + '</div>' +
      '</div>' +
    '</div>';
  }

  function renderCheckout(){
    var s = state;
    var cartEntries = [];
    Object.keys(s.cart).forEach(function(id){ if (s.cart[id] > 0) cartEntries.push([id, s.cart[id]]); });
    var cartLines = cartEntries.map(function(entry){
      var id = entry[0], qty = entry[1];
      var p = PRODUCTS.filter(function(x){ return x.id===id; })[0];
      return {id:id, qty:qty, name:p.name, img:p.img, priceLabel: money(p.price), unit:p.price, lineTotal: money(p.price*qty)};
    });
    var totalQty = cartLines.reduce(function(a,l){ return a+l.qty; }, 0);
    var subtotal = cartLines.reduce(function(a,l){ return a+l.unit*l.qty; }, 0);
    var volumeDiscountPct = subtotal >= 600000 ? 10 : (subtotal >= 300000 ? 5 : 0);
    var discount = subtotal * volumeDiscountPct/100;
    var total = subtotal - discount;
    var creditAvailable = CREDIT_LIMIT - CREDIT_USED;
    var minOrderWarning = subtotal>0 && subtotal < MIN_ORDER;
    var checkoutBlocked = s.accountStatus !== 'approved';
    var checkoutReady = s.accountStatus === 'approved';
    var cartEmpty = cartLines.length===0;
    var cartNotEmpty = cartLines.length>0;

    var cartLinesHtml = cartLines.map(function(l){
      return '' +
      '<div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid #ededed">' +
        '<img src="' + l.img + '" style="width:46px;height:46px;object-fit:contain"/>' +
        '<div style="flex:1">' +
          '<div style="font-size:13.5px;font-weight:700;color:#232323">' + esc(l.name) + '</div>' +
          '<div style="font-size:12px;color:#a3a3a3">' + l.priceLabel + ' c/u</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<button data-action="cartDec" data-arg="' + l.id + '" style="width:24px;height:24px;border:1px solid #dbdcdd;background:#fff;border-radius:var(--radius-sm);cursor:pointer;font-weight:700">−</button>' +
          '<span style="font-size:13px;font-weight:700;width:20px;text-align:center">' + l.qty + '</span>' +
          '<button data-action="cartInc" data-arg="' + l.id + '" style="width:24px;height:24px;border:1px solid #dbdcdd;background:#fff;border-radius:var(--radius-sm);cursor:pointer;font-weight:700">+</button>' +
        '</div>' +
        '<div style="font-size:13.5px;font-weight:800;width:110px;text-align:right;color:#232323">' + l.lineTotal + '</div>' +
        '<button data-action="cartRemove" data-arg="' + l.id + '" style="background:none;border:none;color:#c9171e;font-size:12px;cursor:pointer">Quitar</button>' +
      '</div>';
    }).join('');

    var paymentOptions = [
      {id:'echeq', label:'Echeq', sub:'Débito electrónico'},
      {id:'cta_cte', label:'Cuenta Corriente 30 días', sub:'Sujeta a cupo de crédito'},
      {id:'transferencia', label:'Transferencia', sub:'Pago inmediato'},
    ];
    var paymentOptionsHtml = paymentOptions.map(function(pm){
      var sel = s.paymentMethod===pm.id;
      return '<button data-action="selectPayment" data-arg="' + pm.id + '" style="text-align:left;border-radius:var(--radius-sm);padding:12px 14px;font-size:13px;font-weight:700;cursor:pointer;' + (sel ? 'border:2px solid #ef3b23;background:#fdeeec' : 'border:1px solid #dbdcdd;background:#fff') + '">' + esc(pm.label) + '<span style="display:block;font-size:11px;font-weight:400;color:#a3a3a3;margin-top:2px">' + esc(pm.sub) + '</span></button>';
    }).join('');

    var invoiceOptionsHtml = ['A','B'].map(function(label){
      var sel = s.invoiceType===label;
      return '<button data-action="selectInvoice" data-arg="' + label + '" style="flex:1;border-radius:var(--radius-sm);padding:10px;font-size:13px;font-weight:700;cursor:pointer;' + (sel ? 'border:2px solid #ef3b23;background:#fdeeec;color:#c9171e' : 'border:1px solid #dbdcdd;background:#fff;color:#585858') + '">Factura ' + label + '</button>';
    }).join('');

    var submitDisabled = cartLines.length===0 || !s.paymentMethod || subtotal < MIN_ORDER;

    var blockedSection = checkoutBlocked ? (
      '<div style="background:#fff;border:1px dashed #d6c48f;border-radius:var(--radius);padding:50px;text-align:center">' +
        '<div style="font-size:19px;font-weight:800;color:#232323">El checkout se habilita al aprobar tu cuenta</div>' +
        '<p style="font-size:14px;color:#808080;max-width:380px;margin:12px auto 22px">Tu distribuidor todavía está evaluando tu línea de crédito comercial.</p>' +
        '<button data-action="approveAccount" style="background:#232323;color:#fff;border:none;border-radius:var(--radius-sm);padding:12px 22px;font-size:13.5px;font-weight:700;cursor:pointer">(demo) simular aprobación →</button>' +
      '</div>'
    ) : '';

    var readySection = checkoutReady ? (
      (cartEmpty ? '<div style="background:#fff;border:1px solid #dbdcdd;border-radius:var(--radius);padding:60px;text-align:center;color:#a3a3a3;font-size:14px">Tu pedido está vacío. Volvé al catálogo para agregar productos.</div>' : '') +
      (cartNotEmpty ? (
        '<div style="display:grid;grid-template-columns:1.4fr 1fr;gap:24px">' +
          '<div style="background:#fff;border:1px solid #dbdcdd;border-radius:var(--radius);padding:24px">' +
            '<h2 style="font-size:15px;font-weight:800;color:#232323;margin:0 0 16px">Productos (' + totalQty + ')</h2>' +
            cartLinesHtml +
            (minOrderWarning ? '<div style="background:#fdeeec;border:1px solid #f5c9c1;border-radius:var(--radius);padding:12px 14px;margin-top:16px;font-size:12.5px;color:#a3271a">El pedido mínimo es ' + money(MIN_ORDER) + '. Te faltan ' + money(MIN_ORDER-subtotal) + ' para alcanzarlo.</div>' : '') +
            (volumeDiscountPct>0 ? '<div style="background:#eef8ec;border:1px solid #cfe9c8;border-radius:var(--radius);padding:12px 14px;margin-top:16px;font-size:12.5px;color:#3f7a34">Descuento por volumen aplicado: −' + volumeDiscountPct + '% por superar ' + (volumeDiscountPct===10 ? money(600000) : money(300000)) + '.</div>' : '') +
          '</div>' +
          '<div style="display:flex;flex-direction:column;gap:16px">' +
            '<div style="background:#fff;border:1px solid #dbdcdd;border-radius:var(--radius);padding:20px">' +
              '<h2 style="font-size:14px;font-weight:800;color:#232323;margin:0 0 14px">Crédito comercial</h2>' +
              '<div style="height:8px;background:#ededed;border-radius:var(--radius-sm);overflow:hidden;margin-bottom:10px">' +
                '<div style="height:100%;background:#ef3b23;width:' + Math.round(CREDIT_USED/CREDIT_LIMIT*100) + '%"></div>' +
              '</div>' +
              '<div style="display:flex;justify-content:space-between;font-size:12px;color:#808080"><span>Usado ' + money(CREDIT_USED) + '</span><span>Límite ' + money(CREDIT_LIMIT) + '</span></div>' +
              '<div style="font-size:13.5px;font-weight:800;color:#232323;margin-top:10px">Cupo disponible: ' + money(creditAvailable) + '</div>' +
            '</div>' +
            '<div style="background:#fff;border:1px solid #dbdcdd;border-radius:var(--radius);padding:20px">' +
              '<h2 style="font-size:14px;font-weight:800;color:#232323;margin:0 0 14px">Medio de pago</h2>' +
              '<div style="display:flex;flex-direction:column;gap:8px">' + paymentOptionsHtml + '</div>' +
            '</div>' +
            '<div style="background:#fff;border:1px solid #dbdcdd;border-radius:var(--radius);padding:20px">' +
              '<h2 style="font-size:14px;font-weight:800;color:#232323;margin:0 0 14px">Tipo de comprobante</h2>' +
              '<div style="display:flex;gap:8px">' + invoiceOptionsHtml + '</div>' +
            '</div>' +
            '<div style="background:#232323;border-radius:var(--radius);padding:20px;color:#fff">' +
              '<div style="display:flex;justify-content:space-between;font-size:13px;opacity:.75;margin-bottom:6px"><span>Subtotal</span><span>' + money(subtotal) + '</span></div>' +
              '<div style="display:flex;justify-content:space-between;font-size:13px;opacity:.75;margin-bottom:12px"><span>Descuento</span><span>−' + money(discount) + '</span></div>' +
              '<div style="display:flex;justify-content:space-between;font-size:18px;font-weight:900;border-top:1px solid #444;padding-top:12px"><span>Total</span><span>' + money(total) + '</span></div>' +
              '<button data-action="submitOrder" class="btn-primary" ' + dis(submitDisabled) + ' style="margin-top:16px;width:100%;background:#ef3b23;color:#fff;border:none;border-radius:var(--radius-sm);padding:13px;font-size:14px;font-weight:800;cursor:pointer">Confirmar pedido</button>' +
            '</div>' +
          '</div>' +
        '</div>'
      ) : '')
    ) : '';

    return '' +
    '<div>' +
      renderHeader(false) +
      '<div style="max-width:1100px;margin:0 auto;padding:40px 24px 80px">' +
      '<button data-action="go" data-arg="dashboard" style="background:none;border:none;color:#808080;font-size:13px;cursor:pointer;margin-bottom:18px">← Seguir comprando</button>' +
      '<h1 style="font-size:24px;font-weight:900;color:#232323;margin:0 0 26px">Confirmar pedido</h1>' +
      blockedSection + readySection +
      '</div>' +
    '</div>';
  }

  function renderConfirmation(){
    var s = state;
    var orderIsPending = s.orderStatus === 'pending';
    var orderIsConfirmed = s.orderStatus === 'confirmed';
    return '' +
    '<div style="max-width:640px;margin:0 auto;padding:64px 24px 80px;text-align:center">' +
      '<div style="text-align:left;margin-bottom:18px">' +
        '<button data-action="go" data-arg="dashboard" style="background:none;border:none;color:#808080;font-size:13px;cursor:pointer">← Volver al catálogo</button>' +
      '</div>' +
      (orderIsPending ? (
        '<div style="width:60px;height:60px;border-radius:50%;background:#faf1dd;color:#c8901f;font-size:28px;font-weight:900;display:flex;align-items:center;justify-content:center;margin:0 auto 18px">⏳</div>' +
        '<h1 style="font-size:22px;font-weight:900;color:#232323;margin:0">Orden enviada a distribuidor para aprobación</h1>' +
        '<p style="font-size:14px;color:#808080;margin:12px 0 26px">Tu pedido supera el cupo auto-aprobado. ' + esc(s.form.distribuidorNombre) + ' lo va a revisar y confirmar a la brevedad.</p>' +
        '<button data-action="approveDistributorOrder" style="background:#232323;color:#fff;border:none;border-radius:var(--radius-sm);padding:12px 22px;font-size:13.5px;font-weight:700;cursor:pointer;margin-bottom:26px">(demo) el distribuidor confirma →</button>'
      ) : '') +
      (orderIsConfirmed ? (
        '<div style="width:60px;height:60px;border-radius:50%;background:#eef8ec;color:#3f7a34;font-size:28px;font-weight:900;display:flex;align-items:center;justify-content:center;margin:0 auto 18px">✓</div>' +
        '<h1 style="font-size:22px;font-weight:900;color:#232323;margin:0">Pedido confirmado</h1>' +
        '<p style="font-size:14px;color:#808080;margin:12px 0 26px">Tu pedido fue aprobado automáticamente y ya está en preparación.</p>'
      ) : '') +
      '<div style="background:#fff;border:1px solid #dbdcdd;border-radius:var(--radius);padding:26px;text-align:left">' +
        '<div style="display:flex;justify-content:space-between;font-size:13px;color:#808080;margin-bottom:14px"><span>N° de orden</span><span style="font-weight:800;color:#232323">' + esc(s.orderNumber) + '</span></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:13px;color:#808080;margin-bottom:14px"><span>Total</span><span style="font-weight:800;color:#232323">' + money(s.orderTotal) + '</span></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:13px;color:#808080"><span>Entrega estimada</span><span style="font-weight:800;color:#232323">' + (s.orderStatus==='pending' ? '5-7 días hábiles' : '2-3 días hábiles') + '</span></div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;margin-top:26px">' +
        '<button data-action="go" data-arg="dashboard" style="background:none;border:1px solid #dbdcdd;color:#585858;border-radius:var(--radius-sm);padding:12px 20px;font-size:13.5px;font-weight:700;cursor:pointer">Volver al catálogo</button>' +
        '<button data-action="go" data-arg="tracking" style="background:#ef3b23;color:#fff;border:none;border-radius:var(--radius-sm);padding:12px 20px;font-size:13.5px;font-weight:700;cursor:pointer">Ver seguimiento</button>' +
      '</div>' +
    '</div>';
  }

  function renderTracking(){
    var s = state;
    var statusMap = {
      pending: {label:'Pendiente aprobación', style:'background:#fdf6e8;color:#8a6b2f'},
      confirmed: {label:'Confirmada', style:'background:#eef8ec;color:#3f7a34'},
      in_transit: {label:'En camino', style:'background:#eaf1fb;color:#2b5f9e'},
      delivered: {label:'Entregada', style:'background:#ededed;color:#585858'},
    };
    var ordersHtml = s.orders.map(function(o){
      var st = statusMap[o.status] || statusMap.confirmed;
      return '' +
      '<div style="background:#fff;border:1px solid #dbdcdd;border-radius:var(--radius);padding:18px 20px;display:flex;align-items:center;gap:18px">' +
        '<div style="flex:1">' +
          '<div style="font-size:13.5px;font-weight:800;color:#232323">' + esc(o.number) + '</div>' +
          '<div style="font-size:12px;color:#a3a3a3;margin-top:2px">' + esc(o.date) + ' · ' + esc(o.items.join(', ')) + '</div>' +
        '</div>' +
        '<div style="font-size:13.5px;font-weight:800;color:#232323">' + money(o.total) + '</div>' +
        '<div style="font-size:11.5px;font-weight:700;padding:6px 12px;border-radius:var(--radius-pill);white-space:nowrap;' + st.style + '">' + st.label + '</div>' +
        '<button data-action="reorder" data-arg="' + esc(o.id) + '" style="background:#232323;color:#fff;border:none;border-radius:var(--radius-sm);padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">Reordenar</button>' +
      '</div>';
    }).join('');

    return '' +
    '<div>' +
      renderHeader(false) +
      '<div style="max-width:860px;margin:0 auto;padding:44px 24px 80px">' +
        '<h1 style="font-size:24px;font-weight:900;color:#232323;margin:0 0 6px">Seguimiento y pedidos</h1>' +
        '<p style="font-size:14px;color:#808080;margin:0 0 28px">Historial de compras y estado de tus pedidos en curso.</p>' +
        '<div style="display:flex;flex-direction:column;gap:12px">' + ordersHtml + '</div>' +
      '</div>' +
    '</div>';
  }

  function renderProductModal(){
    var s = state;
    var p = PRODUCTS.filter(function(x){ return x.id === s.selectedProductId; })[0];
    if (!p) return '';
    var accApproved = s.accountStatus === 'approved';
    var priceLabel = accApproved ? money(p.price) : '—';
    var tierLabel = accApproved ? '6+: 5% off · 12+: 10% off' : 'Disponible tras aprobación';
    var priceBlurStyle = accApproved ? '' : 'filter:blur(3px);opacity:.5';
    var views = s.viewCounts[p.id] || 0;
    var adds = s.addCounts[p.id] || 0;
    return '' +
    '<div data-action="closeProductModal" style="position:fixed;inset:0;background:rgba(20,20,20,.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:24px">' +
      '<div data-action="stopProp" style="background:#fff;border-radius:var(--radius);max-width:520px;width:100%;overflow:hidden;max-height:88vh;overflow-y:auto">' +
        '<div style="position:relative">' +
          '<img src="' + p.img + '" style="width:100%;height:200px;object-fit:contain;background:#f8f7f5;display:block"/>' +
          '<button data-action="closeProductModal" style="position:absolute;top:12px;right:12px;width:30px;height:30px;border-radius:50%;border:none;background:rgba(255,255,255,.9);font-size:15px;font-weight:700;cursor:pointer;color:#585858">✕</button>' +
        '</div>' +
        '<div style="padding:24px">' +
          '<span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:' + p.color + '">' + esc(p.linea) + '</span>' +
          '<h2 style="font-size:20px;font-weight:900;color:#232323;margin:8px 0 4px">' + esc(p.name) + '</h2>' +
          '<p style="font-size:13.5px;color:#808080;line-height:1.5;margin:0 0 16px">' + esc(p.desc) + '</p>' +
          '<div style="' + priceBlurStyle + '">' +
            '<div style="font-size:22px;font-weight:900;color:#232323">' + priceLabel + '</div>' +
            '<div style="font-size:12px;color:#a3a3a3;margin-bottom:16px">' + tierLabel + '</div>' +
          '</div>' +
          '<div style="background:#f8f7f5;border:1px solid #ededed;border-radius:var(--radius-sm);padding:16px;margin:16px 0">' +
            '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#a3a3a3;margin-bottom:10px">Interés de esta cuenta</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;text-align:center">' +
              '<div><div style="font-size:19px;font-weight:900;color:#232323">' + views + '</div><div style="font-size:11px;color:#a3a3a3">Vistas</div></div>' +
              '<div><div style="font-size:19px;font-weight:900;color:#232323">' + adds + '</div><div style="font-size:11px;color:#a3a3a3">Agregados</div></div>' +
              '<div><div style="font-size:19px;font-weight:900;color:#232323">Catálogo</div><div style="font-size:11px;color:#a3a3a3">Origen</div></div>' +
            '</div>' +
          '</div>' +
          '<button data-action="addToCart" data-arg="' + p.id + '" ' + dis(!accApproved) + ' style="width:100%;background:' + p.color + ';color:#fff;border:none;border-radius:var(--radius-sm);padding:12px;font-size:13.5px;font-weight:700;cursor:pointer">' + (accApproved ? 'Agregar al pedido' : 'Requiere aprobación') + '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderSignupAlert(){
    if (!state.showSignupAlert) return '';
    return '' +
    '<div data-action="closeSignupAlert" style="position:fixed;inset:0;background:rgba(20,20,20,.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:24px">' +
      '<div data-action="stopProp" style="background:#fff;border-radius:var(--radius);max-width:380px;width:100%;padding:28px;text-align:center">' +
        '<div style="width:48px;height:48px;border-radius:50%;background:#fdeeec;color:#c9171e;font-size:22px;font-weight:900;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">!</div>' +
        '<h2 style="font-size:17px;font-weight:800;color:#232323;margin:0 0 8px">Completá tus datos</h2>' +
        '<p style="font-size:13.5px;color:#808080;line-height:1.5;margin:0 0 20px">Necesitamos tu nombre, email profesional y contraseña para poder crear tu cuenta.</p>' +
        '<button data-action="closeSignupAlert" style="width:100%;background:#ef3b23;color:#fff;border:none;border-radius:var(--radius-sm);padding:12px;font-size:13.5px;font-weight:700;cursor:pointer">Entendido</button>' +
      '</div>' +
    '</div>';
  }

  function dispatch(action, ds, ev){
    var s = state;
    switch(action){
      case 'go': s.screen = ds.arg; break;
      case 'logout':
        ampli.userLoggedOut();
        s.screen='login'; s.authIsLogin=true; s.accountStatus='none';
        s.cart={}; s.search=''; s.activeLinea=''; s.selectedProductId=null;
        s.paymentMethod=''; s.invoiceType='B'; s.orderStatus=''; s.orderNumber=''; s.orderTotal=0;
        break;

      case 'setAuthLogin': s.authIsLogin = true; break;
      case 'setAuthSignup': s.authIsLogin = false; break;
      case 'loginExisting': s.accountStatus='approved'; s.screen='dashboard'; s.form.distribuidorId = DISTRIBUIDORES[0].id; s.form.distribuidorNombre = DISTRIBUIDORES[0].name; ampli.userLoggedIn(); break;
      case 'setSignupNombre': s.signup.nombre = ev.target.value; break;
      case 'setSignupEmail': s.signup.email = ev.target.value; break;
      case 'setSignupPassword': s.signup.password = ev.target.value; break;
      case 'submitSignup':
        if (!s.signup.nombre.trim() || !s.signup.email.trim() || !s.signup.password.trim()) {
          s.showSignupAlert = true;
        } else {
          s.screen = 'onboarding';
          ampli.accountCreationStarted();
        }
        break;
      case 'closeSignupAlert': s.showSignupAlert = false; break;

      case 'setMatricula': s.form.matricula = ev.target.value; break;
      case 'setProvincia': s.form.provincia = ev.target.value; break;
      case 'setCuit': s.form.cuit = ev.target.value; break;
      case 'goStep': 
        if(s.onboardStep == 1) {
          ampli.proffesionalNumberAdded() ;
        } else if (s.onboardStep == 2 && Number(ds.arg) == 3) {
          ampli.cuitAdded() ;
        } else if (s.onboardStep == 4 && Number(ds.arg) == 5) {
          ampli.documentAdded() ;
        }
        s.onboardStep = Number(ds.arg); 
        break;
      case 'setDoc': {
        var file = ev.target.files && ev.target.files[0];
        s.form.docName = file ? file.name : '';
        break;
      }
      case 'selectIva': s.form.condicionIva = ds.arg; break;
      case 'selectDistribuidor': {
        var d = DISTRIBUIDORES.filter(function(x){ return x.id === ds.arg; })[0];
        if (d) { s.form.distribuidorId = d.id; s.form.distribuidorNombre = d.name; }
        ampli.distributorSelected();
        break;
      }
      case 'submitOnboarding': s.onboardPhase = 'pending'; s.accountStatus = 'pending'; ampli.accountCreated(); break;
      case 'approveAccount': s.accountStatus = 'approved'; 
        ampli.distribuitorApproved({
          distributor_name: s.form.distribuidorNombre,
          is_approved: true,
          reason: 'Documentación validada'
        }) ; 
        break;
      case 'goDashboardBrowsing': s.screen = 'dashboard'; break;
      case 'onboardingLogoGo': if (s.accountStatus==='approved') s.screen='dashboard'; break;

      case 'setSearch': s.search = ev.target.value; break;
      case 'setActiveLinea': s.activeLinea = ds.arg || ''; break;
      case 'openProduct':
        var p = PRODUCTS.filter(function(x){ return x.id === ds.arg; })[0];
        s.selectedProductId = ds.arg;
        s.viewCounts[ds.arg] = (s.viewCounts[ds.arg]||0)+1;
        ampli.productViewed({
          product_name: p.name,
          distribuitor_id: s.form.distribuidorId,
          price:p.price,
          distribuitor_name: s.form.distribuidorNombre,
          product_id: p.id
        });
        break;
      case 'closeProductModal': s.selectedProductId = null; break;
      case 'stopProp': return;
      case 'addToCart': {
        var qty = Number(ds.qty || 1);
        var p = PRODUCTS.filter(function(x){ return x.id === ds.arg; })[0];
        s.cart[ds.arg] = (s.cart[ds.arg]||0) + qty;
        s.addCounts[ds.arg] = (s.addCounts[ds.arg]||0) + 1;
        ampli.productAddedToCart(
          {
          product_name: p.name,
          distribuitor_id: s.form.distribuidorId,
          price: p.price,
          distribuitor_name: s.form.distribuidorNombre,
          product_id: p.id
          }
        );
        break;
      }

      case 'cartInc': s.cart[ds.arg] = (s.cart[ds.arg]||0) + 1; break;
      case 'cartDec': s.cart[ds.arg] = Math.max(0, (s.cart[ds.arg]||0) - 1); break;
      case 'cartRemove': s.cart[ds.arg] = 0; break;
      case 'selectPayment': s.paymentMethod = ds.arg; break;
      case 'selectInvoice': s.invoiceType = ds.arg; break;
      case 'submitOrder': {
        var cartEntries = [];
        Object.keys(s.cart).forEach(function(id){ if (s.cart[id] > 0) cartEntries.push([id, s.cart[id]]); });
        var cartLines = cartEntries.map(function(entry){
          var id = entry[0], qty = entry[1];
          var p = PRODUCTS.filter(function(x){ return x.id===id; })[0];
          return {id:id, qty:qty, name:p.name, unit:p.price};
        });
        var subtotal = cartLines.reduce(function(a,l){ return a+l.unit*l.qty; }, 0);
        var volumeDiscountPct = subtotal >= 600000 ? 10 : (subtotal >= 300000 ? 5 : 0);
        var total = subtotal - subtotal*volumeDiscountPct/100;
        var creditAvailable = CREDIT_LIMIT - CREDIT_USED;
        var pending = s.paymentMethod==='cta_cte' || total > creditAvailable;
        var number = 'B2B-24081-0' + (190 + s.orders.length);
        s.orderStatus = pending ? 'pending' : 'confirmed';
        s.orderNumber = number;
        s.orderTotal = total;
        s.orders = [{id:number, number:number, date:'11 Ago 2026', items: cartLines.map(function(l){ return l.name+' x'+l.qty; }), total:total, status: pending?'pending':'confirmed'}].concat(s.orders);
        s.cart = {};
        s.screen = 'confirmation';
        ampli.orderPlaced();
        break;
      }
      case 'approveDistributorOrder': s.orderStatus = 'confirmed'; break;
      case 'reorder': s.cart = {}; s.screen = 'checkout'; break;
      default: break;
    }
    render();
  }

  function findAction(target){
    var el = target;
    while (el && el !== app) {
      if (el.hasAttribute && el.hasAttribute('data-action')) return el;
      el = el.parentNode;
    }
    return null;
  }

  app.addEventListener('click', function(e){
    if (e.target.tagName === 'SELECT') return;
    if (e.target.tagName === 'INPUT' && e.target.type === 'file') return;
    var el = findAction(e.target);
    if (!el) return;
    dispatch(el.dataset.action, el.dataset, e);
  });
  app.addEventListener('input', function(e){
    if (e.target.tagName === 'SELECT') return;
    var el = findAction(e.target);
    if (!el) return;
    dispatch(el.dataset.action, el.dataset, e);
  });
  app.addEventListener('change', function(e){
    var el = findAction(e.target);
    if (!el) return;
    dispatch(el.dataset.action, el.dataset, e);
  });

  render();
})();