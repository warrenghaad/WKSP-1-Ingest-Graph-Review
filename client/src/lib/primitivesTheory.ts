export type MAGICKey = "M" | "A" | "G" | "I" | "C";

export interface HistoricalEvidence {
  title: string;
  year: number;
  phase: "discovery" | "innovation" | "invention";
  description: string;
  imageUrl: string;
  civilization: string;
  magicDrivers: MAGICKey[];
}

export interface PrimitiveData {
  id: string;
  name: string;
  dimension: string;
  symbol: string;
  color: string;
  geometryDef: string;
  physicsRole: string;
  asForce: string;
  asMotion: string;
  asEnergy: string;
  asState: string;
  creates: string;
  createdBy: string;
  operation: string;
  motionVector: string;
  outputRule: string;
  durationRule: string;
  kidDiagram: string;
  buildsInto: string[];
  metaphor: string;
  function: string;
  convergenceNote: string;
  artifactExamples: string;
  culturalExpression: string;
  evidence: HistoricalEvidence[];
}

export interface ArtTheoryEntry {
  id: string;
  primitiveId: string;
  title: string;
  year: number;
  civilization: string;
  description: string;
  imageUrl: string;
  metaphorRegister: string;
  functionRegister: string;
  convergence: string;
}

export const PRIMITIVES: PrimitiveData[] = [
  {
    id: "point",
    name: "Point",
    dimension: "0D",
    symbol: "·",
    color: "#94a3b8",
    geometryDef: "A location with no size. Zero dimensions. It marks WHERE something is, not what it is.",
    physicsRole: "Center of mass. Every object has one location where all weight balances. Gravity creates the point — the place where force converges. Universal because gravity is universal.",
    asForce: "Point of application — where force acts. Contact point. Fulcrum. Pivot.",
    asMotion: "Position — the 'where' at any instant. Velocity = change in point position over time.",
    asEnergy: "Potential energy = stored position. A ball on a hill has energy because of its point in space relative to gravity.",
    asState: "Equilibrium — the single point where all forces cancel. Stability = returning to the point after disturbance.",
    creates: "Point + sweep = Line. Point + rotation = Circle. Point + all-direction motion = Sphere.",
    createdBy: "Two lines intersecting = Point. Surface projected to vanishing = Point. Volume collapsed = Point.",
    operation: "Sweep, rotate, project, expand",
    motionVector: "Zero vector (stationary) or directional vector (translating point)",
    outputRule: "0D × 1D motion = 1D line. 0D × 2D motion = 2D surface. 0D × 3D motion = 3D volume.",
    durationRule: "Instantaneous = point stays point. Extended = line. Infinite = ray. Reversed = return to origin.",
    kidDiagram: "A dot on paper. Put your pencil down — that's a point. It tells you WHERE but not HOW BIG.",
    buildsInto: ["Circle", "8-Pointed Star", "Triangle", "Square", "Spiral", "Arc", "Hexagon", "Pyramid"],
    metaphor: "The navel of the world. The center of the temple. The place where heaven meets earth — the axis mundi.",
    function: "Survey datum point. The fixed reference from which all land measurements begin. The bronze spike in the ground.",
    convergenceNote: "The temple IS the survey origin. The sacred center IS the measurement center. Meaning and function are the same point.",
    culturalExpression: "Temple foundation deposits, boundary stones (kudurru), omphalos markers",
    artifactExamples: "Babylonian kudurru boundary stones, Nippur survey datum",
    evidence: [
      {
        title: "Foundation Cone of Gudea",
        year: -2144,
        phase: "discovery",
        description: "Clay nail driven into temple foundations marking the exact sacred center — the axis mundi made physical. A point in space where heaven and earth connect.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP360672.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["I", "G"],
      },
      {
        title: "Kudurru Boundary Stone",
        year: -1200,
        phase: "innovation",
        description: "Carved stone marking a fixed point in the landscape — survey datum AND divine witness. The same point serves engineering measurement and cosmic order.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-33308-002.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["M", "I", "C"],
      },
      {
        title: "Surveyor's Bronze Spike",
        year: -2000,
        phase: "innovation",
        description: "Metal spike hammered into ground as permanent reference point for all subsequent land measurements. The literal zero-dimensional origin of coordinate systems.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-42229-001.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["M", "G"],
      },
      {
        title: "Map of Nippur",
        year: -1500,
        phase: "invention",
        description: "Oldest known city map — multiple survey points establishing a coordinate grid. Points became a system for representing space on a clay tablet.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP273239.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["M", "A", "G", "I", "C"],
      },
    ],
  },
  {
    id: "line",
    name: "Line",
    dimension: "1D",
    symbol: "—",
    color: "#60a5fa",
    geometryDef: "A path extending infinitely in two directions with no width. One dimension.",
    physicsRole: "Force travels in straight paths. Light, gravity, thrown objects — all follow lines (before curves intervene). The shortest distance between two points is a line because energy minimizes travel.",
    asForce: "Force vector — direction and magnitude. Tension in a rope. Compression in a column. The line IS the force.",
    asMotion: "Trajectory — the path an object follows. Velocity vector. Displacement.",
    asEnergy: "Work = force along a line × distance. Energy transfer happens along lines.",
    asState: "Linear = predictable. Straight-line motion = no net force perpendicular to path. Newton's first law.",
    creates: "Line + rotation = Circle/Cylinder. Line + parallel translation = Plane. Line + perpendicular sweep = Rectangle.",
    createdBy: "Two planes intersecting = Line. Surface edge = Line. Circle diameter = Line.",
    operation: "Rotate, translate, extrude, reflect",
    motionVector: "1D vector along the line, or perpendicular to create surface",
    outputRule: "1D × parallel motion = still 1D. 1D × perpendicular motion = 2D plane. 1D × rotation = 2D cylinder surface.",
    durationRule: "Segment = finite. Ray = half-infinite. Line = fully infinite. All three exist in nature.",
    kidDiagram: "Stretch a string between two fingers. The string IS a line. Pull it tight — it goes straight because that's the shortest path.",
    buildsInto: ["Triangle", "Square", "Hexagon", "8-Pointed Star", "Pyramid"],
    metaphor: "The plumb line — a string with a weight. Connects heaven (where you hold it) to earth (where gravity pulls it). The path of divine judgment: straight, true, unyielding.",
    function: "The surveyor's rope stretched between two stakes. Canal alignment. Wall construction. The straightedge of cuneiform wedge impressions.",
    convergenceNote: "The plumb line IS divine truth AND engineering precision. 'True' means morally straight AND geometrically straight. Same word, same concept.",
    culturalExpression: "Plumb lines, surveyor ropes (eblu), canal alignments, wall courses",
    artifactExamples: "Surveyor's rope with knots (Egyptian), plumb bobs, measuring rods",
    evidence: [
      {
        title: "Copper Measuring Rod",
        year: -2600,
        phase: "discovery",
        description: "Standardized copper rod from Nippur — the physical embodiment of a line segment. One cubit length became the basis for all Mesopotamian measurement.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/ME56_81_51.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["M"],
      },
      {
        title: "Plumb Bob Weight",
        year: -2400,
        phase: "discovery",
        description: "Stone weight on cord — gravity creates a perfect vertical line. Used for both temple alignment (sacred) and wall construction (practical). Same tool, same truth.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/ME69_181.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["G", "M"],
      },
      {
        title: "Canal Survey Tablet",
        year: -2100,
        phase: "innovation",
        description: "Administrative tablet recording canal alignments — lines drawn on clay representing lines dug in earth. The abstraction of the physical line into mathematical notation.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/ME86_11_284.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["M", "I", "G"],
      },
      {
        title: "Ur III Canal System",
        year: -2050,
        phase: "invention",
        description: "Network of precisely aligned irrigation canals spanning hundreds of kilometers. Lines became infrastructure — the line as force vector (water flow) became civilization's lifeline.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DT860.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["M", "A", "G", "I", "C"],
      },
    ],
  },
  {
    id: "angle",
    name: "Angle",
    dimension: "1D",
    symbol: "∠",
    color: "#f59e0b",
    geometryDef: "The measure of rotation between two lines sharing an endpoint. Measured in degrees.",
    physicsRole: "When two forces meet from different directions, they create an angle. River tributaries joining. Roof beams meeting at a peak. Angle determines how force distributes — steep angles concentrate, shallow angles spread.",
    asForce: "Force resolution — splitting one force into components. The angle between applied force and surface determines friction, normal force, and acceleration.",
    asMotion: "Direction change. The angle between old and new velocity vectors. Reflection angle = incidence angle.",
    asEnergy: "Angle determines energy partition. A ramp at 45° splits gravitational energy equally between horizontal and vertical components.",
    asState: "Angle of repose — the steepest angle a pile of material can maintain. Critical angle = phase transition between static and dynamic.",
    creates: "Angle + closure × 3 = Triangle. Angle + closure × 4 = Rectangle. Angle + repetition = Star.",
    createdBy: "Two lines meeting = Angle. Tangent to curve at a point = Angle. Light refraction = Angle change.",
    operation: "Bisect, trisect, replicate, close",
    motionVector: "Rotational: angular velocity around the vertex point",
    outputRule: "Angle × closure repetition = polygon. Angle × continuous rotation = full circle. Angle × alternation = zigzag.",
    durationRule: "Partial closure = open angle. 180° = straight line. 360° = full rotation back to start. >360° = spiral.",
    kidDiagram: "Open a book partway. The pages make an angle. Open it more — bigger angle. Close it — zero angle. The hinge is the vertex.",
    buildsInto: ["Triangle", "Square", "8-Pointed Star", "Hexagon", "Pyramid"],
    metaphor: "The horned crown of the gods. Two horns meeting at the head — the angle is divine authority made visible. The zigzag of lightning (Adad) — angles as the shape of divine power.",
    function: "The 360-degree system (Mesopotamian invention). Brick-laying angles for ziggurats. The gnomon shadow angle for timekeeping. Angle of canal gradient for water flow.",
    convergenceNote: "360 degrees = 360 days (approximate year). The angle system IS the calendar system. Measuring space and measuring time use the same unit because the sky rotates.",
    culturalExpression: "360° system, zigzag patterns on pottery, horned crowns, gnomon shadows",
    artifactExamples: "Sundial gnomon, ziggurat brick angles, horned deity crowns",
    evidence: [
      {
        title: "Gnomon Shadow Clock",
        year: -3500,
        phase: "discovery",
        description: "Vertical stick casting shadow — the angle between sun and gnomon measures time. The first instrument that converted angular change into information.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-23667-001.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["M", "G"],
      },
      {
        title: "Sexagesimal Angle Tablet",
        year: -1800,
        phase: "innovation",
        description: "Mathematical tablet with base-60 angle calculations — 360 degrees invented HERE. The angular measurement system that the entire modern world still uses.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/ME86_11_284.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["M", "I"],
      },
      {
        title: "Ziggurat of Ur Brick Course",
        year: -2100,
        phase: "innovation",
        description: "Precisely angled brick layers creating the stepped pyramid — each terrace at calculated angles for structural stability. The angle as force distributor made monumental.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DT923.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["G", "A", "I"],
      },
      {
        title: "Astrolabe of Mul.Apin",
        year: -1200,
        phase: "invention",
        description: "Circular star catalog dividing the sky into angular sectors — astronomy born from angle measurement. The 360° system applied to the cosmos, predicting seasons, eclipses, and planting times.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-16679-001.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["M", "A", "G", "I", "C"],
      },
    ],
  },
  {
    id: "curve",
    name: "Curve",
    dimension: "1D",
    symbol: "⌒",
    color: "#a855f7",
    geometryDef: "A line that changes direction continuously. No straight segments. Every point has a different heading.",
    physicsRole: "Objects under continuous force bend. Water flowing around obstacles curves. Planets orbiting stars curve. Curves exist because force doesn't stop — it keeps acting, bending the straight path.",
    asForce: "Centripetal force — the inward pull that bends straight motion into curves. Tension in a spinning rope. Gravity bending planetary paths.",
    asMotion: "Orbital motion. Circular motion. Any trajectory where acceleration is perpendicular to velocity.",
    asEnergy: "Rotational kinetic energy. The energy stored in spinning objects. Flywheel energy storage.",
    asState: "Periodicity — curved paths return to their starting point. Cycles. Oscillation. The curve as time's signature.",
    creates: "Curve + closure = Circle. Curve + expansion = Spiral. Curve + extrusion = Cylinder. Curve + revolution = Sphere/Torus.",
    createdBy: "Plane cutting cone = Conic sections (circle, ellipse, parabola, hyperbola). Force bending line = Curve.",
    operation: "Close, expand, revolve, extrude",
    motionVector: "Continuously changing direction vector — always tangent to the curve, always turning",
    outputRule: "Curve × closure = circle. Curve × expansion + rotation = spiral. Curve × linear extrusion = cylinder.",
    durationRule: "Partial rotation = arc/triskelion. Full rotation = circle. Expanding rotation = spiral. Infinite = sphere.",
    kidDiagram: "Tie a string to a rock and spin it. The rock's path IS a curve. Let go — it flies straight. The curve only exists because you keep pulling.",
    buildsInto: ["Circle", "Spiral", "Arc", "8-Pointed Star"],
    metaphor: "The crescent of Sin (moon god). The curve as the shape of time — waxing and waning. The curve of the horizon where earth meets sky. The shape of birth (the womb).",
    function: "Potter's wheel rim. The curved wall of granaries (distributes outward pressure evenly). The arch in early architecture. The curve of the sickle blade — optimized for cutting grain.",
    convergenceNote: "The crescent moon IS a sickle. Same curve, one in the sky (metaphor for cycles), one in the hand (function for harvest). The farmer looks up and sees his tool written in the heavens.",
    culturalExpression: "Crescent moon symbols, sickle blades, potter's wheel rims, arched doorways",
    artifactExamples: "Crescent moon standards, bronze sickles, wheel-thrown pottery",
    evidence: [
      {
        title: "Clay Sickle Blade",
        year: -6000,
        phase: "discovery",
        description: "Curved clay blade for cutting grain — the oldest deliberate curve in tool-making. The curve optimizes cutting force along the grain stalk. Physics dictated the shape before anyone knew physics.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/ME41_55.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["G"],
      },
      {
        title: "Potter's Wheel Fragment",
        year: -4000,
        phase: "innovation",
        description: "Earliest potter's wheel — continuous rotation creating perfect curves. The first machine that converts linear force (pushing) into rotational motion. Centripetal force made useful.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-12449-001.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["G", "A", "M"],
      },
      {
        title: "Wheeled Chariot Model",
        year: -2600,
        phase: "innovation",
        description: "Model chariot with disc wheels — the curve (circle) becomes transportation. Rolling reduces friction by converting sliding contact to a single point of contact that continuously moves.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DT880.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["M", "G", "C"],
      },
      {
        title: "Crescent Moon Standard of Ur",
        year: -2500,
        phase: "invention",
        description: "Bronze crescent atop a standard — the moon's curve as divine symbol. The same curve seen in the sickle, the wheel, and the sky. Metaphor and function converged: the farmer's tool IS the god's symbol.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-15117-022.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["M", "A", "G", "I", "C"],
      },
    ],
  },
  {
    id: "plane",
    name: "Plane",
    dimension: "2D",
    symbol: "▭",
    color: "#22c55e",
    geometryDef: "A flat surface extending infinitely in two directions. Two dimensions. No thickness.",
    physicsRole: "Gravity creates horizontal planes — water always finds level. Surfaces form where material accumulates evenly. The ground IS a plane because gravity pulls everything down equally.",
    asForce: "Normal force — the perpendicular push-back of any surface. The ground pushes up on your feet with exactly the force gravity pulls you down.",
    asMotion: "2D motion — movement confined to a surface. Sliding, rolling, skating. Projectile motion is parabolic in a plane.",
    asEnergy: "Surface energy — the energy stored at the boundary between two materials. Surface tension in water. The energy cost of creating new surface area.",
    asState: "Level = stable. Tilted = unstable (things slide). The plane as the reference for all gravitational stability.",
    creates: "Plane + folding = 3D solid. Plane + stacking = Volume. Plane + curving = Surface.",
    createdBy: "Volume sliced = Plane. Two intersecting volumes = Plane boundary. Gravity on liquid = Level plane.",
    operation: "Fold, stack, curve, intersect, tile",
    motionVector: "2D vectors in the plane surface — any direction within the flat surface",
    outputRule: "2D × perpendicular motion = 3D volume. 2D × parallel motion = still 2D. 2D × folding = 3D polyhedron.",
    durationRule: "Finite plane = tablet, field, terrace. Infinite plane = mathematical abstraction. Tiled plane = tessellation.",
    kidDiagram: "Put water on a table. It spreads flat — that's a plane. The water shows you where 'level' is because gravity makes it flat.",
    buildsInto: ["Square", "Triangle", "Hexagon", "Pyramid"],
    metaphor: "The floodplain. The flat world between the waters above and the waters below. The tablet surface — the plane on which all knowledge is written.",
    function: "The clay tablet itself — a manufactured plane for recording information. Irrigated field leveling. The ziggurat terrace — each level a plane cut from the mountain shape.",
    convergenceNote: "The tablet IS the world model. A flat surface you write on IS a flat earth you build on. The scribe creating knowledge on a plane IS the god creating the world as a plane.",
    culturalExpression: "Clay tablets, leveled irrigation fields, ziggurat terraces, flat-bottomed boats",
    artifactExamples: "Cuneiform tablets, field survey records, architectural terraces",
    evidence: [
      {
        title: "Uruk Proto-Cuneiform Tablet",
        year: -3400,
        phase: "discovery",
        description: "Earliest writing on a flat clay surface — the manufactured plane as information medium. Creating a plane (flattening clay) was the prerequisite for recording thought.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP360616.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["A", "I"],
      },
      {
        title: "Field Survey Tablet",
        year: -2400,
        phase: "innovation",
        description: "Administrative record of leveled irrigation fields — the plane as agricultural technology. Level fields distribute water evenly. The plane IS the technology of feeding a civilization.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP360673.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["M", "G", "I"],
      },
      {
        title: "Ziggurat Terrace Brick",
        year: -2100,
        phase: "innovation",
        description: "Fired brick from a ziggurat terrace — stacked planes creating monumental architecture. Each terrace is a manufactured plane; stacking them creates a mountain-like volume.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DT923.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["G", "A", "C"],
      },
      {
        title: "Mathematical Problem Tablet",
        year: -1800,
        phase: "invention",
        description: "Old Babylonian tablet solving area calculations — the plane abstracted into mathematics. Field area = length × width. The physical plane became a mathematical concept, enabling engineering at any scale.",
        imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/ME11_217_3.jpg",
        civilization: "Mesopotamia",
        magicDrivers: ["M", "A", "G", "I", "C"],
      },
    ],
  },
];

export const GENERATIVE_GRAMMAR: {
  from: string;
  operation: string;
  duration: string;
  result: string;
  physicsAnalogy: string;
}[] = [
  { from: "Point", operation: "Sweep", duration: "Extended", result: "Line", physicsAnalogy: "Force applied to mass creates displacement" },
  { from: "Point", operation: "Rotate (full)", duration: "360°", result: "Circle", physicsAnalogy: "Centripetal force creates orbit" },
  { from: "Point", operation: "Rotate (expanding)", duration: "Infinite", result: "Spiral", physicsAnalogy: "Angular momentum with increasing radius" },
  { from: "Line", operation: "Rotate", duration: "Full", result: "Circle", physicsAnalogy: "Rigid body rotation around endpoint" },
  { from: "Line", operation: "Translate ⊥", duration: "Finite", result: "Rectangle", physicsAnalogy: "Extrusion — force perpendicular to length" },
  { from: "Angle", operation: "Close × 3", duration: "3 steps", result: "Triangle", physicsAnalogy: "Minimum stable structure — truss" },
  { from: "Angle", operation: "Close × 4", duration: "4 steps", result: "Square", physicsAnalogy: "Orthogonal force balance — grid" },
  { from: "Angle", operation: "Close × 6", duration: "6 steps", result: "Hexagon", physicsAnalogy: "Maximum packing efficiency — honeycomb" },
  { from: "Angle", operation: "Alternate × 8", duration: "8 points", result: "8-Pointed Star", physicsAnalogy: "Radial symmetry — equal force distribution" },
  { from: "Curve", operation: "Close", duration: "Full", result: "Circle", physicsAnalogy: "Constant centripetal force" },
  { from: "Curve", operation: "Expand + rotate", duration: "Infinite", result: "Spiral", physicsAnalogy: "Angular momentum with energy input" },
  { from: "Curve", operation: "Partial", duration: "< 360°", result: "Arc", physicsAnalogy: "Partial orbit — projectile trajectory" },
  { from: "Plane", operation: "Fold × 4", duration: "Closed", result: "Pyramid", physicsAnalogy: "Compression to point — center of mass convergence" },
  { from: "Plane", operation: "Tile", duration: "Infinite", result: "Tessellation", physicsAnalogy: "Crystal lattice — minimum energy packing" },
];

export const ART_THEORY: ArtTheoryEntry[] = [
  {
    id: "art-point-1",
    primitiveId: "point",
    title: "Foundation Deposit — Eye Idol",
    year: -3500,
    civilization: "Mesopotamia",
    description: "Abstract eye idol from Tell Brak — the point as sacred gaze. Thousands deposited at a single sacred point, each a witness to the axis mundi.",
    imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-23786-001.jpg",
    metaphorRegister: "The eye IS a point of consciousness. Where the god looks, reality is fixed.",
    functionRegister: "Votive deposit at architecturally determined center point of temple complex.",
    convergence: "The point where all eyes look IS the point where all measurements begin. The sacred and the spatial are identical.",
  },
  {
    id: "art-point-2",
    primitiveId: "point",
    title: "Cylinder Seal Impression — Central Deity",
    year: -2300,
    civilization: "Mesopotamia",
    description: "Akkadian seal showing deity at center with symmetric attendants — the composition radiates from a single point. Art mirrors cosmology: everything emanates from center.",
    imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/ss86_11_51.jpg",
    metaphorRegister: "The king/god as the point from which all order radiates.",
    functionRegister: "Seal design uses radial symmetry from a center point for visual balance.",
    convergence: "Compositional center = cosmic center = political center. Art technique IS theology IS governance.",
  },
  {
    id: "art-line-1",
    primitiveId: "line",
    title: "Stele of Naram-Sin",
    year: -2254,
    civilization: "Mesopotamia",
    description: "Victory stele with diagonal composition line — troops ascend along a line toward the deified king at peak. The line as narrative direction and force vector.",
    imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-33383-001.jpg",
    metaphorRegister: "The ascending line = divine ascent. The king rises above mortals along the axis connecting earth to heaven.",
    functionRegister: "Diagonal composition line guides the viewer's eye from bottom-left to top-right, creating visual narrative flow.",
    convergence: "The compositional line IS the military advance IS the divine ascent. One line, three meanings, all true simultaneously.",
  },
  {
    id: "art-line-2",
    primitiveId: "line",
    title: "Register Lines in Relief Sculpture",
    year: -2600,
    civilization: "Mesopotamia",
    description: "Standard of Ur — horizontal register lines divide narrative scenes. Each line is both organizational (art) and hierarchical (society). The line separates and orders.",
    imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-35030-001.jpg",
    metaphorRegister: "Lines separate cosmic realms — heaven, earth, underworld. Each register is a different plane of existence.",
    functionRegister: "Horizontal lines organize complex narrative into readable sequential scenes, like lines of text.",
    convergence: "The compositional register IS the social hierarchy IS the cosmic order. Horizontal lines in art = horizontal strata in society.",
  },
  {
    id: "art-angle-1",
    primitiveId: "angle",
    title: "Horned Crown of Deity",
    year: -2200,
    civilization: "Mesopotamia",
    description: "Horned crown on deity figures — the angle between horns IS divine authority. More horns = more angles = higher rank. Geometry encodes power in art.",
    imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP293243.jpg",
    metaphorRegister: "The horned crown: angles as visible markers of divine rank. Two horns = minor deity. Seven pairs = supreme god.",
    functionRegister: "Angular projections on headgear identify status in a visual hierarchy system — readable at distance.",
    convergence: "The angle of the horn IS the measure of divine power IS the indicator of social rank. Angular geometry = theology = politics.",
  },
  {
    id: "art-angle-2",
    primitiveId: "angle",
    title: "Zigzag Pattern on Pottery",
    year: -5000,
    civilization: "Mesopotamia",
    description: "Ubaid period pottery with repeated zigzag patterns — angles as the first abstract decorative vocabulary. Lightning, water, mountains — all are zigzag angles.",
    imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP110686.jpg",
    metaphorRegister: "Zigzag = water (rivers zigzag), lightning (Adad's weapon), mountains (zigzag horizon). Nature's angles become art's vocabulary.",
    functionRegister: "Repeated angle patterns create visual rhythm, fill space efficiently, and can be produced with simple tools on wet clay.",
    convergence: "The zigzag that represents water IS the zigzag that channels water (irrigation ditches). Decorative pattern = engineering diagram.",
  },
  {
    id: "art-curve-1",
    primitiveId: "curve",
    title: "Bull Lyre of Ur — Sound Holes",
    year: -2500,
    civilization: "Mesopotamia",
    description: "Curved sound holes on the golden lyre — the curve as acoustic technology AND aesthetic form. The curve that makes beautiful sound IS the curve that looks beautiful.",
    imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-13006-002.jpg",
    metaphorRegister: "The lyre's curves echo the bull's horns, the crescent moon, the river's bend — music IS cosmic harmony.",
    functionRegister: "Sound hole curves are acoustically optimized — their shape determines resonant frequencies and tonal quality.",
    convergence: "The curve that produces the most beautiful sound IS the curve that looks most beautiful. Acoustic optimization = aesthetic perfection.",
  },
  {
    id: "art-curve-2",
    primitiveId: "curve",
    title: "Warka Vase — Flowing Composition",
    year: -3200,
    civilization: "Mesopotamia",
    description: "Alabaster vase from Uruk with curving procession figures — the curve as narrative flow. Figures follow the vessel's curve, story follows form.",
    imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP360616.jpg",
    metaphorRegister: "The procession curves upward toward the goddess — the curve as spiritual ascent, cyclical offering.",
    functionRegister: "Figures arranged along the cylindrical surface create continuous narrative readable by rotating the vase.",
    convergence: "The curve of the vessel IS the curve of the ritual procession IS the cycle of seasons. Container shape = ceremony shape = time's shape.",
  },
  {
    id: "art-plane-1",
    primitiveId: "plane",
    title: "Cylinder Seal — Rolling Plane",
    year: -3000,
    civilization: "Mesopotamia",
    description: "Cylinder seal creating infinite repeating plane — a curved surface (cylinder) generates a flat pattern (plane) through rolling. Curve becomes plane through motion.",
    imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/ss86_11_51.jpg",
    metaphorRegister: "Rolling the seal creates an infinite band — time as endless repetition, the eternal return made visible on clay.",
    functionRegister: "Cylinder rolling converts a finite carved surface into an infinitely repeatable flat pattern — a printing press 5000 years early.",
    convergence: "The seal that stamps authority IS the seal that creates art IS the technology that proves a plane can be generated from a curve. Art = law = geometry.",
  },
  {
    id: "art-plane-2",
    primitiveId: "plane",
    title: "Glazed Brick Panel — Ishtar Gate",
    year: -575,
    civilization: "Mesopotamia",
    description: "Flat glazed brick panels forming the Ishtar Gate — the plane as monumental canvas. Each brick is a pixel; the wall-plane becomes an image.",
    imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-33308-002.jpg",
    metaphorRegister: "The gate's flat panels display guardian beasts — the plane as boundary between sacred and profane space.",
    functionRegister: "Modular flat bricks tessellate perfectly, creating load-bearing walls that are simultaneously art surfaces.",
    convergence: "The structural plane that holds up the gate IS the decorative plane that displays divine imagery. Engineering surface = art surface = sacred boundary.",
  },
];

export const PHYSICS_DIMENSIONS = [
  { label: "Force", description: "How the primitive describes pushes, pulls, tensions, compressions", icon: "→" },
  { label: "Motion", description: "How the primitive describes velocity, acceleration, trajectory", icon: "⟶" },
  { label: "Energy", description: "How the primitive describes storage, transfer, transformation", icon: "⚡" },
  { label: "State", description: "How the primitive describes equilibrium, instability, phase", icon: "◈" },
];
