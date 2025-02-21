let details = `<li class="_css-bKxMGy">
  <div class="_css-ibovja"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" color="#000000">
      <title>Circle</title>
      <path d="M12 23c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11Z" fill="currentColor"></path>
    </svg></div>
  <div class="_css-bWakrQ"></div>
  <div class="_css-cRhxos">
    <div class="_css-gNrRQp">Avenida Ipiranga, 6357 - Partenon - Porto Alegre - RS, 90610-001</div>
    <div class="_css-hGRkFW">
      <p data-baseweb="typo-paragraphsmall" class="_css-geUVjk">9:42 PM</p>
    </div>
  </div>
</li>
<li class="_css-bKxMGy">
  <div class="_css-ibovja"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" color="#000000">
      <title>Square</title>
      <path d="M2 2h20v20H2V2Z" fill="currentColor"></path>
    </svg></div>
  <div class="_css-cRhxos">
    <div class="_css-gNrRQp">Avenida Getúlio Vargas, 619 - Menino Deus - Porto Alegre - RS, 90150-003</div>
    <div class="_css-hGRkFW">
      <p data-baseweb="typo-paragraphsmall" class="_css-geUVjk">9:56 PM</p>
    </div>
  </div>
</li>`


let addesses = (String(details).split('_css-gNrRQp">'));

console.log(addesses[1].split('</div>')[0])
console.log(addesses[2].split('</div>')[0])