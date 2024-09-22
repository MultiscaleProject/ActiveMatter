# Active Elastic Off-centered Soft Disks Simulation

**Authors**:  
Guozheng Lin<sup>1</sup>, Zhangang Han<sup>1</sup>, Amir Shee<sup>2</sup>, Cristián Huepe<sup>1, 2, 3</sup>

**Affiliations**:  
<sup>1</sup> School of Systems Science, Beijing Normal University, Beijing, People's Republic of China  
<sup>2</sup> Northwestern Institute on Complex Systems and ESAM, Northwestern University, Evanston, IL, USA  
<sup>3</sup> CHuepe Labs, Chicago, IL, USA

---

### Project Overview

This repository provides the code and resources for simulating **quenched disorder (QD)** in dense active systems, as introduced in our paper. The model represents **self-propelled polar disks** with non-isotropic rotational and translational dynamics, which interact through linear repulsive forces. These interactions give rise to a novel **noise-induced quenched disorder state**, observed at intermediate noise levels, where agents become jammed in random orientations with small fluctuations around their fixed positions.

The simulations explore various phases, including:
1. **Moving Order (MO)** - Agents align in a common direction.
2. **Dynamic Disorder (DD)** - Headings continuously change due to rotational diffusion.
3. **Quenched Disorder (QD)** - Intermediate noise induces jamming with fluctuating headings.

---

### How to Use the Code

#### Prerequisites:
- Python 3.x
- Required libraries can be installed via `requirements.txt`.

#### Installation:
Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/QuenchedDisorderModel.git
cd QuenchedDisorderModel
pip install -r requirements.txt
