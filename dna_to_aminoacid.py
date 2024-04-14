from Bio.Seq import Seq
from os import listdir
from os.path import isfile, join
import re

DNAFiles = [f for f in listdir("DNA")]


for idx, var in enumerate(DNAFiles):
	atgcpath = "DNA/" + var
	aminopath = "aminoacid/" + var
	
	atgc = open(atgcpath, 'r')
	amino = open(aminopath, 'w+')

	data = atgc.read()
	mod = len(data)%3
	if mod != 0:
		data = data[:-mod]
	seq = Seq(data).translate(stop_symbol="\n")
	amino.write(str(seq))
 
	print(seq)
	atgc.close()

# atgc = ''.join(re.findall('[ATGC]',"TTAAAGATTA TAAATTAACT TATTATACTC CGGACTATGA AACCAAGGAT ACCGATATTT\
# TGGCAGCCTT WCGAGTCACT CCTCAACCCG GAGTTCCCCC GGAAGAAGCA GGGGCCGCAG\
# TAGCAGCCGA ATCGTCTACT GGTACATGGA CAACTGTGTG GACCGATGGG CTTACGAGCC\
# TTKATCGTTM CAAAGGGAGA TGCTATCACA TMGAGCCCGT TKCCGGAGAA RAAACTCAAT\
# TTATTGCTTA TGTAGCTTAC CCATTAGACC TTTTTGAAGA AGGTTSTGTT ACTAACATGT\
# TTAYTTCCAT TGKGGGTAAT GTATTTGGAT TTAAAGCACT GCGTGCTCTA CGTCTAGAAG\
# ATTTGCGAAT CCCAACTGCG TATATTAAAA CATTTCAAGG CCCGCCTCAY GGCATCCAAG\
# KTGAGAGAGA TAAATTGAAC AAGTATGGTC GTCCCCTATT GGGATGTACT ATTAAACCAA\
# AATTAGGGTT ATCCGCTAAA AACTACGGCA GA"))

#print(Seq(atgc).translate(stop_symbol=" "))
