type ViaCepResponse = {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean | string
}

export type AddressLookup = {
  street: string
  neighborhood: string
  city: string
  state: string
}

/** Busca o endereço pelo CEP na ViaCEP. Falhas são ignoradas: o usuário preenche manualmente. */
export async function lookupZipCode(zipCode: string): Promise<AddressLookup | null> {
  const digits = zipCode.replace(/\D/g, '')
  if (digits.length !== 8) return null

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
    if (!response.ok) return null

    const data = (await response.json()) as ViaCepResponse
    if (data.erro) return null

    return { street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf }
  } catch {
    return null
  }
}
