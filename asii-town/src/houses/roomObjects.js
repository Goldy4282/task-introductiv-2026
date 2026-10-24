// Accept both the original [label, description, image] tuples and named objects.
export function getRoomObjects(member) {
  return member.objects.map((item, index) => Array.isArray(item)
    ? {id: `${member.id}:${index}`, label: item[0], description: item[1], image: item[2]}
    : {...item, id: item.id || `${member.id}:${index}`});
}
