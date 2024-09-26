#!/bin/zsh
# define an array of chirality
chirality=("0.05" "0.1"  "0.5" "1.0" "5.0")
#chirality=("0.01")
# loop over the array
for chi in "${chirality[@]}"
do
    # create a new directory for each value of polydispersity
    dir_name="chi_${chi}"
    mkdir -p $dir_name

    (
        # change to the new directory
        cd $dir_name

        # run the Python script in this subshell
        python3 ../full_analysis.py --chi=$chi
    )
done
