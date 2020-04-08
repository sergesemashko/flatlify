import S from 'string';

export function camelize(value) {
  return S(value)
    .slugify()
    .camelize().s;
}
