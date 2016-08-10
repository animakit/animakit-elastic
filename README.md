# AnimakitElastic
React component for flexible resizing of the blocks.

## Usage

```javascript
<AnimakitElastic>
  <div className="text">
    { this.props.text }
  </div>
</AnimakitElastic>
```

## [Demo](https://animakit.github.io/#/elastic)

## Installation

```
npm install animakit-elastic
```

## Properties

| Property | Required | Type | Default Value  | Available Values  | Description |
| ----- | ----- | ----- | ----- | ----- | ----- |
| duration | false | number | `500` | Any integer number | Duration of animation |
| easing | false | string | `ease-out` | Any [easing function](http://easings.net/) | Easing function of animation |

## Limitations

The components wrapper uses `overflow: hidden` to implement the animation.

## Origin

Part of Animakit.
See https://animakit.github.io for more details.

<a href="https://evilmartians.com/?utm_source=animakit">
  <img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
       alt="Sponsored by Evil Martians" width="236" height="54">
</a>
