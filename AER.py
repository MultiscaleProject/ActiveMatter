# -*- coding: utf-8 -*-
"""
January - March 2022

Author: Guozheng Lin, Amir Shee, and Cristian Huepe
"""
import numpy as np
import numba as nb
from numpy import sin, cos, sqrt, pi, arctan2

import matplotlib 
#matplotlib.use("Agg")
import matplotlib.pyplot as plt
import os, time, sys

#************parameters**************** 
Maxsteps = 1000000
dt = 0.01
N = 400
v0 = 0.002 #float(sys.argv[1])
k = 5
alpha = 0.02
beta = 1.2
rc = 1
l0 = 1
R_range = [0.3]
Dr_range = [0.2]
L = 20 #box lenght
W = 20 * sqrt(3) / 2
ro_range = ['round0']
#*************************************************

#************update function(numba)****************        
@nb.jit(["float64[:](float64[:,:], int64, int64, int64[:], float64, float64, float64, float64)"], nopython=True)
def update(state, mW, mL, maps, v0, R, Dr, rc):
    
    vxtot = 0.
    vytot = 0.
    vp = np.zeros(4)
    
    #sort all particles
    head = np.ones(mL*mW, dtype=nb.int64) * (-1) #-1 represent no agent in this bin
    link = np.ones(N, dtype=nb.int64) * (-1)
    
    for i in range(N):
        xr = state[i][0] + R * cos(state[i][2])
        yr = state[i][1] + R * sin(state[i][2])
        while xr >= L:    
            xr -= L
        while xr < 0:
            xr += L
        
        while yr >= W:    
            yr -= W
        while yr < 0:
            yr += W 
        
        iicell = np.floor(xr / L * mL) + np.floor(yr / W * mW) * mL
        icell = int(iicell)

        link[i] = head[icell]
        head[icell] = i
        
        vxtot += cos(state[i][2])
        vytot += sin(state[i][2])
    
    p = sqrt(vxtot ** 2 + vytot ** 2) / N
    
    newstate = np.zeros((N, 3), dtype=nb.float64)
    for i in range(N):
        xi = state[i][0]
        yi = state[i][1]        
        cosi = cos(state[i][2])
        sini = sin(state[i][2])
        xr = xi + R * cosi
        yr = yi + R * sini
        while xr >= L:    
            xr -= L
        while xr < 0:
            xr += L
        
        while yr >= W:    
            yr -= W
        while yr < 0:
            yr += W 
            
        iicell = np.floor(xr / L * mL) + np.floor(yr / W * mW) * mL
        icell = int(iicell)
        
        j = head[icell]
        #loop over all particles below i in the current cell
        FX = 0.
        FY = 0.
        
        nab_cells = np.zeros(9, dtype=nb.int64)
        nab_cells[0] = icell
        for nabor in range(8):
            nab_cells[nabor+1] = maps[8*icell+nabor]
        
        for jcell in nab_cells:
            j = head[jcell]
            while j != -1:
                if j != i:
                    xj = state[j][0]
                    yj = state[j][1]        
                    cosj = cos(state[j][2])
                    sinj = sin(state[j][2])
                    dx = xj - xi
                    dy = yj - yi
                    rx = dx + R * (cosj - cosi)
                    ry = dy + R * (sinj - sini)
                    dist1 = sqrt(rx ** 2 + ry ** 2) - rc
                    dist2 = sqrt((L - abs(rx)) ** 2 + ry ** 2) - rc
                    dist3 = sqrt(rx ** 2 + (W - abs(ry)) ** 2) - rc
                    dist4 = sqrt((L - abs(rx)) ** 2 + (W - abs(ry)) ** 2) - rc
                    if (dist1 < 0) | (dist2 < 0) | (dist3 < 0) | (dist4 < 0):
                        
                        while dx > L / 2:    
                            dx -= L
                        while dx < - L / 2:
                            dx += L
                        
                        while dy > W / 2:    
                            dy -= W
                        while dy < - W / 2 :
                            dy += W
                        
                        rx = dx + R * (cosj - cosi)
                        ry = dy + R * (sinj - sini)
                        dis = sqrt(rx ** 2 + ry ** 2) 
                        dis_uv_xij = rx / dis
                        dis_uv_yij = ry / dis
                        
                        FX += k / l0 * (dis - l0) * dis_uv_xij
                        FY += k / l0 * (dis - l0) * dis_uv_yij
        
                j = link[j]
        
        FV1 = FX * cosi + FY * sini
        FV2 = FY * cosi - FX * sini
        vs = alpha * FV1 + v0
        vx = vs * cosi
        vy = vs * sini
        
        vp[0] += vx
        vp[1] += vy
        vp[2] += (vx * xi + vy * yi) / (xi ** 2 + yi ** 2) ** 0.5
        vp[3] += (-vx * yi + vy * xi) / (xi ** 2 + yi ** 2)
        
        newstate[i][0] = xi + dt * vx
        newstate[i][1] = yi + dt * vy
        
        dtau = arctan2(FY, FX) - state[i][2]
        torque = dtau - dtau ** 3 / 6 + dtau ** 5 /120 - dtau ** 7 / 5040 + dtau ** 9 / 362880
        newangle = state[i][2] + dt * (beta * torque + sqrt(2 * Dr) / (dt ** 0.5) * np.random.normal(0,1))
        
        newstate[i][2] = newangle
        
        #periodic boundary conditions
        
        while newstate[i][0] < 0:
            newstate[i][0] += L     
        while newstate[i][0] >= L:
            newstate[i][0] -= L
        while newstate[i][1] < 0:
            newstate[i][1] += W 
        while newstate[i][1] >= W: 
            newstate[i][1] -= W 
        
    #positions and velocities update
    for i in range(N):
        state[i][0] = newstate[i][0]
        state[i][1] = newstate[i][1]
        state[i][2] = newstate[i][2]
    
    return vp / N
#*************************************************

#************Functions definitions****************
def mapas(mL, mW):
    mapsize = 8 * mL * mW
    maps = np.zeros(mapsize, dtype=int);
    for iy in range(mW):
        for ix in range(mL):
            imap = icell(ix, iy, mL, mW) * 8
            maps[imap  ] = icell(ix+1, iy  , mL, mW)
            maps[imap+1] = icell(ix+1, iy+1, mL, mW)
            maps[imap+2] = icell(ix  , iy+1, mL, mW)
            maps[imap+3] = icell(ix-1, iy+1, mL, mW)
            maps[imap+4] = icell(ix-1, iy,   mL, mW)
            maps[imap+5] = icell(ix-1, iy-1, mL, mW)
            maps[imap+6] = icell(ix,   iy-1, mL, mW)
            maps[imap+7] = icell(ix+1, iy-1, mL, mW)
        
    return maps

def icell(ix, iy, mL, mW):
    return ix % mL + iy % mW * mL

def initialize(N, ini_type):
    state = np.zeros((N, 3))
    
    if ini_type[0:4] == 'alig':
        
        state[:, 2] = np.ones(N) * np.random.uniform(-pi, pi)
        
        x0 = 0.2
        y0 = 0.2
        for i in range(L):
            for j in range(L):
                state[i*L+j][0] = x0 + j + i % 2 * 0.5
                state[i*L+j][1] = y0 + i * sqrt(3) / 2
    
    if ini_type[0:4] == 'rand':
        
        #initial positions on a square of side L
        state[:, 0] = np.random.uniform(0, L, N)
        state[:, 1] = np.random.uniform(0, W, N)
        # for i in range(N):
        #     if state[i][0] < L / 2:
        #       state[i][2] = 0
        #     else:
        #       state[i][2] = -pi
        state[:, 2] = np.random.uniform(-pi, pi, N)

    #state = np.loadtxt('quenched2.txt')
    
    return state
#*************************************************

#**************simulate run begin*****************
t_start = time.time()
runtime = time.time()
for ro in ro_range:            
    mL = int(L // rc)
    mW = int(W // rc)
    
    for R in R_range:
        for Dr in Dr_range:    
            
            state = initialize(N, 'rand')
            
            pathop = "%s/R=%.3f/op/" % (ro, R)
            if not os.path.exists(pathop):
                os.makedirs(pathop)
        
            pathst = "%s/R=%.3f/state/Dr=%.3f/" % (ro, R, Dr)
            if not os.path.exists(pathst):
                os.makedirs(pathst)
            
            maps = mapas(mL, mW)
            
            int1 = 100
            ptot = np.zeros(Maxsteps//int1+1)
            qtot = np.zeros((N, 2))
            
            int2 = 1000000
            phi = np.zeros(Maxsteps//int2+1)
            
            int3 = 10000
            xyth = np.zeros((Maxsteps//int3+1, 3*N))
            
            int4 = 1000
            vcp = np.zeros((Maxsteps//int4+1, 4))
            
            for n in range(Maxsteps+1):
                if n % (Maxsteps//100) == 0:
                    runtime = time.time() - runtime
                    print("run %.2f, runtime: %.2fs" %(n / (Maxsteps//100), runtime))
                    runtime = time.time() 
                
                if n % int1 == 0:
                    ptot[n//int1] = sqrt(np.sum(cos(state[:, 2])) ** 2 + np.sum(sin(state[:, 2])) ** 2) / N
                
                if n % int3 == 0:
                    xyth[n//int3] = state.flatten()
               
                qtot[:, 0] += cos(state[:, 2])
                qtot[:, 1] += sin(state[:, 2])
                if n % int2 == 0:
                    qtot = qtot / int2
                    phi[n//int2] = np.mean(qtot[:, 0] ** 2 + qtot[:, 1] ** 2)
                    qtot = np.zeros((N, 2))
                
                varray= update(state, mW, mL, maps, v0, R, Dr, rc)
                if n % int4 == 0:
                    vcp[n//int4] = varray

            np.savetxt(pathop + "p_Dr=%.3f.txt" % Dr, ptot, fmt='%.8f')
            np.savetxt(pathop + "phi_Dr=%.3f.txt" % Dr, phi, fmt='%.8f')
            np.savetxt(pathop + "vcp_Dr=%.3f.txt" % Dr, vcp, fmt='%.8f')
            np.savetxt(pathst+'R=%s_Dr=%s.txt' % (str(R), str(Dr)), xyth, fmt='%.8f')
            '''
            fig, ax = plt.subplots(3, 1, figsize=(8,6), dpi=300)
            
            ax[0].plot(np.arange(0, Maxsteps+1, int4), vcp[:, 0], c='blue', lw=0.5, marker='o', ms=1.5, mfc='None', label='vx')
            ax[0].plot(np.arange(0, Maxsteps+1, int4), vcp[:, 1], c='red', lw=0.5, marker='^', ms=1.5, mfc='None', label='vy')
            ax[0].set_ylabel('vx, vy')
            ax[0].legend(loc='upper left')
            
            ax[1].plot(np.arange(0, Maxsteps+1, int4), vcp[:, 2], c='blue', lw=0.5, marker='o', ms=1.5, mfc='None', label='vr')
            ax[1].set_ylabel('vr')
            
            ax[2].plot(np.arange(0, Maxsteps+1, int4), vcp[:, 3], c='red', lw=0.5, marker='^', ms=0.5, mfc='None', label='vtheta')
            ax[2].set_xlabel('t (dt=%s)'%dt)
            ax[2].set_ylabel('vtheta')

            fig.tight_layout()
            fig.savefig(pathop + "vcp_Dtheta=%.3f_v0=%.3f.png" % (Dr, v0))
            plt.close(fig)
            '''
            fig, ax = plt.subplots(1, 2, figsize=(10,4), dpi=300)
            ax[0].plot(np.arange(0, Maxsteps+1, int1), ptot, linestyle='-', color='b', label="polar")
            ax[0].set_ylim([0,1.05])
            ax[0].set_ylabel("polar")
            ax[1].plot(np.arange(Maxsteps//int2+1), phi, 'o-')
            ax[1].set_ylim([0,1])
            ax[1].set_ylabel("quenched")
            fig.savefig(pathop + "op_Dr=%.3f.png" % Dr)
            plt.close(fig)
            
            

t_end = time.time()
print("total_time: %.3fh" % ((t_end - t_start) / 3600))
#*************************************************


