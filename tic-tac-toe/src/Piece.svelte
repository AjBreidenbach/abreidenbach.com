<script>
  export let state
  export let x
  export let y

  let id = `piece-${x}${y}`

  const viewBox =  "0 0 32 32"

  let g
  const O = `<ellipse cx="15.8" cy="15.9" rx="13.1" ry="13.2" opacity=".556" fill="#00f"/><ellipse cx="15.7" cy="15.6" rx="12" ry="12.3" fill="#fff"><animate attributeName="ry" from="0" to="12.3" dur="0.15s" begin="beginEvent"/><animate attributeName="rx" from="0" to="12" dur="0.15s" begin="beginEvent"/></ellipse>`
  const X = `<path d="M15.602 16.813l-.28-.284.294-.295.294-.294.294.294.295.295-.281.284c-.155.156-.293.284-.308.284-.015 0-.153-.128-.308-.284zm11.71 11.767a10.15 10.15 0 01-.847-.702c-.67-.61-3.733-3.72-7.546-7.663l-2.765-2.858.277-.28.277-.281 1.116 1.083c2.928 2.842 4.374 4.183 9.068 8.413.804.724 1.47 1.341 1.478 1.37.01.03-.042.069-.115.086-.308.076-.453.266-.535.698-.026.136-.064.264-.086.285-.02.021-.166-.046-.322-.15zm-23.167.067a.798.798 0 01-.048-.226c-.001-.162-.169-.49-.29-.569a.955.955 0 00-.242-.104c-.073-.017-.125-.056-.115-.085.01-.03.568-.55 1.242-1.158 5.064-4.565 6.37-5.775 9.256-8.578l1.164-1.131.277.28.277.28-3.334 3.45c-5.2 5.38-7.468 7.616-8.002 7.892-.134.07-.14.068-.185-.051zM14.467 15.62a3218.5 3218.5 0 00-5.969-6.026C5.552 6.624 3.15 4.19 3.16 4.182a7.76 7.76 0 01.337-.146c.38-.158.587-.314.848-.641.186-.234.196-.24.275-.157.046.047.96 1.128 2.034 2.401 3.901 4.63 5.767 6.736 8.093 9.13.484.5.88.925.88.946 0 .041-.482.531-.523.531-.013 0-.3-.282-.636-.626zm1.964.368l-.255-.258.092-.108c.05-.06.442-.47.87-.912a120.4 120.4 0 003.362-3.637c1.518-1.71 2.087-2.375 5.92-6.914l.851-1.008.112.134c.33.396.526.56.844.708.186.087.362.158.39.158.027 0 .05.013.05.029 0 .015-2.387 2.434-5.304 5.374-2.917 2.94-5.6 5.65-5.962 6.02-.363.37-.672.672-.687.672-.015 0-.142-.116-.283-.258z" fill="red">

<animateTransform attributeName="transform" attributeType="XML" type="scale" from="0.25" to="1" dur="0.1s" begin="beginEvent" />
    </path>`

  let transform

  $: transform = (function(state) {
    let rotationFactor = state == 1? 180: 10
    let r = Math.floor(Math.random() * rotationFactor - rotationFactor / 2)
    
    return `rotate(${r}, 16, 16)`
  })(state)

  $: if(g) g.innerHTML = state == 1? O: state == -1? X: ''


  $: (function(state){
    if (g && state != 0) {
      g.querySelectorAll(':scope animate, animateTransform').forEach(e => e.beginElement())
    }
    
  })(state)
</script>

<svg x={x * 120} y={y*120} width="120" height="120" viewBox={viewBox} >
  <g id={id} bind:this={g} transform={transform}/>

  <!--animate xlink:href={`#${id}`} attributeName="opacity" from="1" to="0" dur="20s" repeatCount="indefinite" begin="click"/-->
  
</svg>

