#!/bin/zsh

# Define an array of chirality values
chirality=("0.05" "0.1" "0.5" "1.0" "5.0")
# chirality=("0.01")  # Uncomment to test with a single value

# Log file
log_file="run_log.txt"
echo "Starting batch run at $(date)" > $log_file

# Loop over the array of chirality values
for chi in "${chirality[@]}"
do
    # Create a new directory for each chirality value
    dir_name="chi_${chi}"
    mkdir -p $dir_name

    (
        # Change to the new directory
        cd $dir_name || exit

        # Log the progress
        echo "Running full_analysis.py for chirality = $chi in $dir_name" >> "../$log_file"

        # Run the Python script and log any errors
        if ! python3 ../full_analysis.py --chi=$chi >> "../$log_file" 2>&1; then
            echo "Error: full_analysis.py failed for chirality = $chi" >> "../$log_file"
        else
            echo "Completed: full_analysis.py for chirality = $chi" >> "../$log_file"
        fi
    ) &  # Run in parallel (remove & if you prefer serial execution)
done

# Wait for all parallel jobs to finish
wait

echo "Batch run completed at $(date)" >> $log_file
