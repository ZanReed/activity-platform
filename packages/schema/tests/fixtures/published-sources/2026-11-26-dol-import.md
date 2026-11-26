```meta
title: Factorising check
skill: algebra.factorise.common-factor
dol_skills: algebra.factorise.common-factor
```

## Warm up {checkpoint}

Factorise $6x + 9$.

$6x + 9 =$ {{=3}} ( {{=2}} x + {{=3}} )

## Check for understanding {checkpoint dol}

```seed
g: list 4, 6, 8, 9, 10, 12
a: int 2..7
b: int 1..7
p: = g * a
q: = g * b
h: = g / 2
where dol: gcd(a, b) == 1 and mod(g, 2) == 0
```

Factorise fully: $\seed{p}x - \seed{q}$.

$\seed{p}x - \seed{q} =$ {{=g | !h :: Not the highest. :: mis.factorise.not-highest}} ( {{=a}} x - {{=b}} )
