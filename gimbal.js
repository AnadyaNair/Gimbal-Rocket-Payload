const jscad = require('@jscad/modeling')
const { cylinder, cuboid, sphere } = jscad.primitives
const { subtract } = jscad.booleans
const { translate, rotate } = jscad.transforms
const { colorize } = jscad.colors

const main = () => {
  // Capstone Flight Geometry Parameters (mm)
  const rAirframe = 90
  const rRingInner = 58         
  const rHoleCenter = 74        
  const spineBaseZ = -35
  const spineTopZ = 70
  const spineTotalHeight = spineTopZ - spineBaseZ 
  const angles = [0, 90, 180, 270]

  // Photorealistic Aerospace Material Palette
  const cChassis = [0.290, 0.306, 0.412, 1]     // #4a4e69 Slate-Violet
  const cStainless316 = [0.85, 0.88, 0.92, 1]   // Passivated 17-4PH / 316 Stainless Steel
  const cTerminal = [0.204, 0.227, 0.251, 1]    // #343a40 Dark Charcoal Terminal Lugs & Motor Clamps
  const cMotorBlack = [0.12, 0.13, 0.15, 1]     // D3542 Stator Body (Dark Ribbed Metallic)
  const cMotorOrange = [0.95, 0.42, 0.05, 1]    // D3542 Signature Anodized Metallic Orange
  const cHardcoatDeck = [0.18, 0.20, 0.22, 1]   // Type III Hard-Coat Matte Dark Gray Floor
  const cWireRope = [0.15, 0.16, 0.18, 1]       // 1x7 Dark Metallic Carbon Steel Wire Rope

  // 1. GROUNDED SUB-FRAME BASE FLOOR (Circular Disc Deck)
  const groundBase = colorize(
    cHardcoatDeck,
    translate([0, 0, -40], cylinder({ radius: 95, height: 10, segments: 64 }))
  )

  // 2. CONTINUOUS FLEXURE SPINE COLUMN
  const numVertebrae = 10
  const segH = spineTotalHeight / numVertebrae
  let spineParts = []

  for (let i = 0; i < numVertebrae; i++) {
    const zCenter = spineBaseZ + i * segH + segH / 2
    const vDisc = translate([0, 0, zCenter], cylinder({ radius: 30, height: segH - 2, segments: 64 }))
    const vBore = translate([0, 0, zCenter], cylinder({ radius: 18, height: segH + 2, segments: 32 }))
    const vRing = translate([0, 0, spineBaseZ + (i + 1) * segH - 1], cylinder({ radius: 33, height: 2, segments: 64 }))

    spineParts.push(
      colorize(cMotorBlack, subtract(vDisc, vBore)),
      colorize(cMotorOrange, subtract(vRing, vBore))
    )
  }

  const limitRod = colorize(
    cStainless316,
    translate([0, 0, (spineBaseZ + spineTopZ) / 2], cylinder({ radius: 8, height: spineTotalHeight - 4, segments: 32 }))
  )

  // 3. 4 HORIZONTAL D3542 BLDC MOTORS, SPOOLS & #343a40 CUSHIONED CLAMPS
  let bldcMotorParts = []
  let woundSpoolTendons = []

  angles.forEach(deg => {
    const rad = (deg * Math.PI) / 180
    const rotZ = rad

    const mx = 45 * Math.cos(rad)
    const my = 45 * Math.sin(rad)

    const mBody = colorize(
      cMotorBlack,
      translate([mx, my, -25], rotate([0, Math.PI / 2, rotZ], cylinder({ radius: 14, height: 22, segments: 32 })))
    )

    const capFront = colorize(
      cMotorOrange,
      translate([mx, my, -25], rotate([0, Math.PI / 2, rotZ], translate([0, 0, 11], cylinder({ radius: 14.2, height: 3.5, segments: 32 }))))
    )
    const capBack = colorize(
      cMotorOrange,
      translate([mx, my, -25], rotate([0, Math.PI / 2, rotZ], translate([0, 0, -11], cylinder({ radius: 14.2, height: 3.5, segments: 32 }))))
    )

    const shaft = colorize(
      cStainless316,
      translate([mx, my, -25], rotate([0, Math.PI / 2, rotZ], translate([0, 0, 20], cylinder({ radius: 2.5, height: 18, segments: 24 }))))
    )

    const spoolDrum = colorize(
      cStainless316,
      translate([mx, my, -25], rotate([0, Math.PI / 2, rotZ], translate([0, 0, 29], cylinder({ radius: 7.5, height: 12, segments: 32 }))))
    )
    const spoolFlange1 = colorize(
      cStainless316,
      translate([mx, my, -25], rotate([0, Math.PI / 2, rotZ], translate([0, 0, 23], cylinder({ radius: 11, height: 1.5, segments: 32 }))))
    )
    const spoolFlange2 = colorize(
      cStainless316,
      translate([mx, my, -25], rotate([0, Math.PI / 2, rotZ], translate([0, 0, 35], cylinder({ radius: 11, height: 1.5, segments: 32 }))))
    )

    // Robust Thick Cable Parameters for Spool Windings
    const wrapSteps = 24
    const coreR = 1.56
    const strandR = 1.19
    const twistOff = 2.0

    for (let w = -4; w <= 4; w += 2.0) { 
      for (let s = 0; s < wrapSteps; s++) {
        const st = s / wrapSteps
        const drumAngle = st * Math.PI * 2
        const drumR = 9.2
        const cx = drumR * Math.cos(drumAngle)
        const cy = drumR * Math.sin(drumAngle)
        const cz = 29 + w 

        const twistAngle = st * Math.PI * 14

        woundSpoolTendons.push(
          colorize(cWireRope, translate([mx, my, -25], rotate([0, Math.PI / 2, rotZ], translate([cx, cy, cz], sphere({ radius: coreR, segments: 8 })))))
        )
        for (let k = 0; k < 6; k++) {
          const kAng = twistAngle + (k * Math.PI * 2) / 6
          const sx = cx + twistOff * Math.cos(kAng)
          const sy = cy + twistOff * Math.sin(kAng)
          woundSpoolTendons.push(
            colorize(cWireRope, translate([mx, my, -25], rotate([0, Math.PI / 2, rotZ], translate([sx, sy, cz], sphere({ radius: strandR, segments: 8 })))))
          )
        }
      }
    }

    // #343a40 Cushioned Motor Mounting Clamp (Base brackets + strap wrapping motor body)
    const clampBase = colorize(
      cTerminal,
      translate([mx, my, -32], rotate([0, 0, rotZ], cuboid({ size: [30, 18, 6] })))
    )
    const clampStrapOuter = cylinder({ radius: 14.8, height: 8, segments: 32 })
    const clampStrapInner = cylinder({ radius: 14.0, height: 10, segments: 32 })
    const clampStrapShape = subtract(clampStrapOuter, clampStrapInner)
    const clampStrap = colorize(
      cTerminal,
      translate([mx, my, -25], rotate([0, Math.PI / 2, rotZ], clampStrapShape))
    )

    bldcMotorParts.push(mBody, capFront, capBack, shaft, spoolDrum, spoolFlange1, spoolFlange2, clampBase, clampStrap)
  })

  // 4. LOWER HOUSING FRAME RING WITH ENCLOSED CENTER HOLES & BUSHINGS
  const outerRing = cylinder({ radius: rAirframe, height: 15, segments: 64 })
  const innerCut = cylinder({ radius: rRingInner, height: 17, segments: 64 })
  const rawLowerFrame = subtract(outerRing, innerCut)

  const fairleadHoles = angles.map(deg => {
    const rad = (deg * Math.PI) / 180
    return translate([rHoleCenter * Math.cos(rad), rHoleCenter * Math.sin(rad), 2.5], cylinder({ radius: 3.5, height: 20, segments: 32 }))
  })

  const lowerFrame = colorize(
    cChassis, 
    translate([0, 0, 2.5], subtract(rawLowerFrame, ...fairleadHoles))
  )

  const steelBushings = angles.map(deg => {
    const rad = (deg * Math.PI) / 180
    const bx = rHoleCenter * Math.cos(rad)
    const by = rHoleCenter * Math.sin(rad)
    const outerB = cylinder({ radius: 4.5, height: 16, segments: 32 })
    const innerB = cylinder({ radius: 3.5, height: 18, segments: 32 })
    return colorize(cStainless316, translate([bx, by, 2.5], subtract(outerB, innerB)))
  })

  const stanchions = [45, 135, 225, 315].map(deg => {
    const rad = (deg * Math.PI) / 180
    const sx = (rAirframe - 8) * Math.cos(rad)
    const sy = (rAirframe - 8) * Math.sin(rad)
    return colorize(
      cChassis, 
      translate([sx, sy, -20], cylinder({ radius: 6, height: 30, segments: 24 }))
    )
  })

  // 5. TAUT CRISS-CROSS 1x7 DARK CARBON STEEL WIRE ROPE TENDONS
  let continuousBraidedTendons = []

  angles.forEach(deg => {
    const rad = (deg * Math.PI) / 180
    const rStart = rHoleCenter
    const rEnd = 45

    const fx = rHoleCenter * Math.cos(rad)
    const fy = rHoleCenter * Math.sin(rad)

    const helixOffset = 2.0
    const strandRadius = 1.19
    const coreRadius = 1.56

    // A. Vertical Feed
    const vSteps = 45
    for (let v = 0; v <= vSteps; v++) {
      const vt = v / vSteps
      const vz = -25 + vt * 35
      const twistAngle = vt * Math.PI * 24

      continuousBraidedTendons.push(
        colorize(cWireRope, translate([fx, fy, vz], sphere({ radius: coreRadius, segments: 8 })))
      )
      for (let k = 0; k < 6; k++) {
        const kAngle = twistAngle + (k * Math.PI * 2) / 6
        const sx = fx + helixOffset * Math.cos(kAngle)
        const sy = fy + helixOffset * Math.sin(kAngle)
        continuousBraidedTendons.push(
          colorize(cWireRope, translate([fx, fy, vz], sphere({ radius: strandRadius, segments: 8 })))
        )
      }
    }

    // B. Taut Path Arc (Criss-Cross Weave terminating cleanly just below terminals)
    const arcSteps = 60
    for (let a = 0; a <= arcSteps; a++) {
      const at = a / arcSteps
      const currR = rStart * (1 - at) + rEnd * at
      const currZ = 10 + at * (67 - 10)

      const cx = currR * Math.cos(rad)
      const cy = currR * Math.sin(rad)

      const twistAngle = at * Math.PI * 34
      continuousBraidedTendons.push(
        colorize(cWireRope, translate([cx, cy, currZ], sphere({ radius: coreRadius, segments: 8 })))
      )
      for (let k = 0; k < 6; k++) {
        const kAngle = twistAngle + (k * Math.PI * 2) / 6
        const sx = cx + helixOffset * Math.cos(kAngle)
        const sy = cy + helixOffset * Math.sin(kAngle)
        continuousBraidedTendons.push(
          colorize(cWireRope, translate([cx, cy, currZ], sphere({ radius: strandRadius, segments: 8 })))
        )
      }
    }
  })

  // 5.5 PERFECTLY ALIGNED #343a40 CABLE TERMINAL LUGS
  let cableThimbles = []
  angles.forEach(deg => {
    const rad = (deg * Math.PI) / 180
    const tx = 45 * Math.cos(rad)
    const ty = 45 * Math.sin(rad)
    const tz = 67

    const tiltAngle = 0.48 
    const barrel = translate([tx, ty, tz], rotate([0, tiltAngle, rad], cylinder({ radius: 2.2, height: 6, segments: 24 })))
    const tabRaw = translate([tx + 2.5 * Math.cos(rad), ty + 2.5 * Math.sin(rad), tz + 3], rotate([0, 0, rad], cuboid({ size: [6, 8, 3] })))
    const boltHole = translate([tx + 2.5 * Math.cos(rad), ty + 2.5 * Math.sin(rad), tz + 3], rotate([0, Math.PI / 2, 0], cylinder({ radius: 1.2, height: 8, segments: 16 })))
    const lug = subtract(tabRaw, boltHole)

    cableThimbles.push(colorize(cTerminal, barrel), colorize(cTerminal, lug))
  })

  // 6. TOP PAYLOAD PLATFORM (Color: #4a4e69)
  const topSquare = cuboid({ size: [90, 90, 12] })
  const topAperture = cylinder({ radius: 26, height: 16, segments: 64 })
  const topBevelCut = cylinder({ radius: 56, height: 16, segments: 64 })

  const rawTop = subtract(topSquare, topAperture)
  const topPlatform = colorize(
    cChassis, 
    translate([0, 0, spineTopZ + 6], subtract(rawTop, subtract(cuboid({ size: [110, 110, 16] }), topBevelCut)))
  )

  // PAYLOAD CLAMPS (L-Brackets at top 4 vertices)
  let payloadClamps = []
  ;[45, 135, 225, 315].forEach(deg => {
    const rad = (deg * Math.PI) / 180
    const cx = 38 * Math.cos(rad)
    const cy = 38 * Math.sin(rad)
    const basePlate = colorize(cMotorBlack, translate([cx, cy, spineTopZ + 12], rotate([0, 0, rad], cuboid({ size: [10, 10, 2] }))))
    const vertPlate = colorize(cMotorBlack, translate([cx - 3*Math.cos(rad), cy - 3*Math.sin(rad), spineTopZ + 17], rotate([0, 0, rad], cuboid({ size: [3, 10, 8] }))))
    payloadClamps.push(basePlate, vertPlate)
  })

  return [
    groundBase,
    ...spineParts,
    limitRod,
    ...bldcMotorParts,
    ...woundSpoolTendons,
    ...stanchions,
    lowerFrame,
    ...steelBushings,
    ...continuousBraidedTendons,
    ...cableThimbles,
    topPlatform,
    ...payloadClamps
  ]
}

module.exports = { main }
