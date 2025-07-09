#!/bin/bash

# Script pour corriger automatiquement les fichiers de tests
echo "Correction des fichiers de tests en cours..."

# Fonction pour corriger un fichier
fix_file() {
    local file=$1
    echo "Correction de $file..."
    
    # Ajouter l'import ParticipationStatus si absent
    if grep -q "import.*ChallengeParticipation.*from" "$file" && ! grep -q "ParticipationStatus" "$file"; then
        sed -i '' "s/import { ChallengeParticipation }/import { ChallengeParticipation, ParticipationStatus }/g" "$file"
    fi
    
    # Remplacer les strings par l'enum
    sed -i '' "s/status: 'active'/status: ParticipationStatus.ACTIVE/g" "$file"
    sed -i '' "s/status: 'completed'/status: ParticipationStatus.COMPLETED/g" "$file"
    sed -i '' "s/status: 'abandoned'/status: ParticipationStatus.ABANDONED/g" "$file"
    
    # Corriger les assertions
    sed -i '' "s/assert.equal(.*\.status, 'active')/assert.equal(result.participants[0].status, ParticipationStatus.ACTIVE)/g" "$file"
    sed -i '' "s/assert.equal(.*\.status, 'completed')/assert.equal(result.participants[0].status, ParticipationStatus.COMPLETED)/g" "$file"
    
    # Ajouter createdAt et updatedAt aux WorkoutSession (pattern simple)
    sed -i '' 's/exercisesCompleted: \[\([^]]*\)\],$/exercisesCompleted: [\1],\n            createdAt: new Date(),\n            updatedAt: new Date(),/g' "$file"
}

# Liste des fichiers à corriger
files=(
    "/Users/mathissportiello/ESGI/S2/nodeproject/node-prijet/tests/unit/use_cases/challenge/leave_challenge.spec.ts"
    "/Users/mathissportiello/ESGI/S2/nodeproject/node-prijet/tests/unit/use_cases/challenge/delete_challenge.spec.ts"
    "/Users/mathissportiello/ESGI/S2/nodeproject/node-prijet/tests/unit/use_cases/client/get_workout_history.spec.ts"
    "/Users/mathissportiello/ESGI/S2/nodeproject/node-prijet/tests/unit/use_cases/client/get_user_stats.spec.ts"
)

# Corriger chaque fichier
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        fix_file "$file"
    else
        echo "Fichier non trouvé: $file"
    fi
done

echo "Correction terminée!"