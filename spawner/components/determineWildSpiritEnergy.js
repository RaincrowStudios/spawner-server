module.exports = (spiritTemplate) => {
  let energy

  if (spiritTemplate.wild.energy.includes('-')) {
    const [min, max] = spiritTemplate.wild.energy.split('-')

    energy = Math.floor(
      Math.random() * (parseInt(max, 10) - parseInt(min, 10) + 1)
    ) + parseInt(min, 10)
  }
  else {
    energy = parseInt(spiritTemplate.wild.energy, 10)
  }

  return energy
}
