```meta
kind: bank
skill: rate.unit-rate
title: Practice bank fixture — derived variables and where
status: draft
```

```seed
bn: list 10, 20
sn: list 4, 6
bp: list 3.00, 3.60, 4.00
sp: list 1.80, 2.40
bu: = bp / bn
su: = sp / sn
vh: list 2, 4, 5
vd: list 100, 200, 250, 500
qa: list 2, 3
qb: list 5, 7
where t2: bp > sp and bu < su
where t3: mod(vd, vh) == 0
```

## t2

A {bn}-pack costs \${bp} and a {sn}-pack costs \${sp}. One item from the {bn}-pack costs \${{=bu | !su :: That is the smaller pack. :: mis.rate.compares-totals}}.

## t3

A van drives {vd} km in {vh} hours. Its speed is {{=vd/vh | !vh/vd :: That is hours per kilometre. :: mis.rate.ratio-inverted}} km per hour.

## t4

{qa} boxes of {qb} pens and 1 more box hold {{=qa\*qb+qb | !qa\*qb :: That leaves out the extra box.}} pens.
