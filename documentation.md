# WebGL TypeScript Game Project Overview

This game engine is a top-down RPG builder, that leverages the ECS design philosophy to create
emmersive worlds, focused on emergent systems.

## ECS

### Overview

Not going to go over the basics of ECS here. Please take a look at this
[FAQ page](https://github.com/SanderMertens/ecs-faq)

### Implementation details

#### Entity

An entity is a purely abstract concept. It's like a Bitcoin. The entity is more of a concept than an
object. Each entity has an ID, and the only thing we track about the entities is the ID

#### Component

These are the real foundations of our ECS system. We make use of sparse to dense mappings for memory
colocation to improve perfomance, by reducing the amount of time the CPU spends waiting for data to
be read from memory.

Currently we offer 3 methods of representing a component:

- SparseComponent - Best used for complex components that are not frequently read, or include only a
  few entities. Not really used, everytime I use this structure, I get about 1 hour in before
  realising that this leads to so manyu bottleneck issues
- DenseComponent - Created to address the bottleneck issues I was facing with the SparseComponent.
  Instead of mapping an entity directly to a component object, we remove component objects and
  replace them with an array of values. These values represent the data that would be in the
  component object. (Includes some minor overhead for mapping data from an object, to just values
  which can be stored in a TypeArray).
- PartitionedDenseComponent - Since the game uses multiple map entities, the physics and render
  systems ran into issues with most of the entities being received from the DenseComponent being
  offscreen. Additionally, these Dense Components were growing in size and risked being larger than
  the CPU cache itself, so I chose to do some more premature optimizations. Now we can partition
  DenseComponents. Currently we only partition based on the componentValue of Map Entities.

#### Systems

I'm still getting the hang of systems. I know for my strategy I want to use a combination of real-
time simulation for on active map entities, but use more efficient methods for off screen
simulations (Differential Equations, statistical modelling, etc.)

## How is map data represented.

Instead of creating an entity for each tile we simply use a 1D array and map the indices to map
coordinates. Index 0 is (0, 0), Index 1 is (1, 0), Index ${MapWidth} is (0, 1). This allows us to
optimize our diffusion systems (used for ground moisture and fertility).

## How is diffusion simulated

Very naively at present. Currently we use a simple implementation of a diffusion equaiton.
$X_{i,t+1} = X_{i,t} + \alpha \delta t (\frac{1}{N} \sum_{n=0}^{N} X_{n,t} - X_{i,t})$

Where:

- $N$ is the number of neighbours
- $X_{i,t}$ is the value of component X, at position $i$ and time $t$
- $X_{n,t}$ is the value of the neigbouring entity's component, at time $t$.

Other methods for diffusion have explored and may replace this current method. These include:

- Diffusal Equation (Using Discrete Approximation)
- Standard FFT with manually correction for incorrect boundaries
- Sine Transform (DST) with Dirichlet boundary
- Cosine Transform (DCT) with Fixed Gradient Bounndary (Specifically a Neumann Boundary for a closed
  system effect)

## To Do:

[ ] - Render System (this one has been giving me a headache. Trying to do rendering in ECS is less
intuitive than I expected).
[ ] - Integrate React based frontend.
[ ] - Create a fertilization system and then set up a vegatation system
