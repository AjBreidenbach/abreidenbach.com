<script>
  const COLOR_GREEN = '#328b51'
  const COLOR_RED = '#b91b49'
  import {onMount} from 'svelte'
  export let piece

  let animation

  let {color, x, y} = piece
  let _color = color == 1? COLOR_GREEN: COLOR_RED
  let _x = 20 + x * 32, _y = -12 + (6 - y) * 32
  let dur =  (0.5 / Math.sqrt(y + 1)) + 's'

  onMount( _ => animation.beginElement())
</script>

<circle cx={_x} cy={_y} r="13" fill={_color} >
<animate bind:this={animation} attributeName="cy" from="0" to={_y} dur={dur} begin="startEvent"/>
</circle>
